import {
	App,
	CfnOutput,
	aws_cloudfront as CloudFront,
	Duration,
	aws_events as Events,
	aws_events_targets as EventsTargets,
	aws_iam as IAM,
	aws_lambda as Lambda,
	aws_logs as Logs,
	aws_s3 as S3,
	Stack,
} from 'aws-cdk-lib'
import { CD } from './CD.js'
import type { RegistryLambdas } from './RegistryLambdas.js'
import { STACK_NAME } from './stackConfig.js'

export class RegistryStack extends Stack {
	public constructor(
		parent: App,
		{
			lambdaSources,
			repository,
			gitHubOICDProviderArn,
		}: {
			lambdaSources: RegistryLambdas
			repository: Repository
			gitHubOICDProviderArn: string
		},
	) {
		super(parent, STACK_NAME)

		const bucket = new S3.Bucket(this, 'registryBucket', {
			publicReadAccess: true,
			websiteIndexDocument: 'registry.json',
			cors: [
				{
					allowedHeaders: ['*'],
					allowedMethods: [S3.HttpMethods.GET],
					allowedOrigins: ['*'],
					exposedHeaders: ['Content-Type'],
				},
			],
		})

		const distribution = new CloudFront.CfnDistribution(
			this,
			'websiteDistribution',
			{
				distributionConfig: {
					enabled: true,
					priceClass: 'PriceClass_100',
					defaultRootObject: 'registry.json',
					defaultCacheBehavior: {
						allowedMethods: ['HEAD', 'GET', 'OPTIONS'],
						cachedMethods: ['HEAD', 'GET'],
						compress: true,
						forwardedValues: {
							queryString: true,
							headers: [
								'Access-Control-Request-Headers',
								'Access-Control-Request-Method',
								'Origin',
							],
						},
						smoothStreaming: false,
						targetOriginId: 'S3',
						viewerProtocolPolicy: 'redirect-to-https',
					},
					ipv6Enabled: true,
					viewerCertificate: {
						cloudFrontDefaultCertificate: true,
					},
					origins: [
						{
							domainName: `${bucket.bucketName}.s3-website.${this.region}.amazonaws.com`,
							id: 'S3',
							customOriginConfig: {
								originProtocolPolicy: 'http-only',
							},
						},
					],
				},
			},
		)

		const publishToS3 = new Lambda.Function(this, 'publishToS3', {
			handler: lambdaSources.publishToS3.handler,
			architecture: Lambda.Architecture.ARM_64,
			runtime: Lambda.Runtime.NODEJS_18_X,
			timeout: Duration.minutes(1),
			memorySize: 1792,
			code: Lambda.Code.fromAsset(lambdaSources.publishToS3.lambdaZipFile),
			description: 'Update parameter export on S3 when parameters change',
			environment: {
				VERSION: this.node.tryGetContext('version'),
				STACK_NAME,
				BUCKET_NAME: bucket.bucketName,
				CLOUDFRONT_DISTRIBUTION_ID: distribution.attrId,
			},
			logRetention: Logs.RetentionDays.ONE_WEEK,
			initialPolicy: [
				new IAM.PolicyStatement({
					actions: ['ssm:GetParametersByPath'],
					resources: [
						`arn:aws:ssm:${this.region}:${this.account}:parameter/${STACK_NAME}/public`,
					],
				}),
				new IAM.PolicyStatement({
					actions: ['cloudfront:CreateInvalidation'],
					resources: [
						`arn:aws:cloudfront::${this.account}:distribution/${distribution.attrId}`,
					],
				}),
			],
		})

		bucket.grantWrite(publishToS3)

		const publishToS3Rule = new Events.Rule(this, 'publishToS3Rule', {
			eventPattern: {
				source: ['aws.ssm'],
				detailType: ['Parameter Store Change'],
				detail: {
					operation: ['Create', 'Update'],
				},
			},
			targets: [new EventsTargets.LambdaFunction(publishToS3)],
		})

		publishToS3.addPermission('publishToS3InvokePermission', {
			principal: new IAM.ServicePrincipal('events.amazonaws.com'),
			sourceArn: publishToS3Rule.ruleArn,
		})

		// Set up role for CD
		const gitHubOIDC = IAM.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
			this,
			'gitHubOICDProvider',
			gitHubOICDProviderArn,
		)
		const cd = new CD(this, { repository, gitHubOIDC })

		new CfnOutput(this, 'cdRoleArn', {
			exportName: `${this.stackName}:cdRoleArn`,
			description: 'Role to use in GitHub Actions',
			value: cd.role.roleArn,
		})

		new CfnOutput(this, 'registryEndpoint', {
			exportName: `${this.stackName}:registryEndpoint`,
			description: 'Endpoint used for fetch the parameters',
			value: `https://${distribution.attrDomainName}`,
		})
	}
}

export type StackOutputs = {
	registryEndpoint: string
}
