import { App, CfnOutput, aws_s3 as S3, Stack } from 'aws-cdk-lib'
import type { RegistryLambdas } from './RegistryLambdas.js'
import { STACK_NAME } from './stackConfig.js'

export class RegistryStack extends Stack {
	public constructor(
		parent: App,
		{
			lambdaSources,
		}: {
			lambdaSources: RegistryLambdas
		},
	) {
		super(parent, STACK_NAME)

		const bucket = new S3.Bucket(this, 'registryBucket', {
			publicReadAccess: true,
			websiteIndexDocument: 'registry.json',
		})

		new CfnOutput(this, 'registryEndpoint', {
			exportName: `${this.stackName}:registryEndpoint`,
			description: 'Endpoint used for fetch the parameters',
			value: bucket.bucketWebsiteUrl,
		})
	}
}

export type StackOutputs = {
	registryEndpoint: string
}
