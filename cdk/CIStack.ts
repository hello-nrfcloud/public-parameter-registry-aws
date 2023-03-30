import { App, CfnOutput, Duration, aws_iam as IAM, Stack } from 'aws-cdk-lib'
import { CI_STACK_NAME } from './stackConfig.js'

export class CIStack extends Stack {
	public constructor(
		parent: App,
		{
			repository: r,
		}: {
			repository: {
				owner: string
				repo: string
			}
		},
	) {
		super(parent, CI_STACK_NAME)

		const githubDomain = 'token.actions.githubusercontent.com'
		const ghProvider = new IAM.OpenIdConnectProvider(this, 'githubProvider', {
			url: `https://${githubDomain}`,
			clientIds: ['sts.amazonaws.com'],
			thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1'],
		})

		const ghRole = new IAM.Role(this, 'ghRole', {
			roleName: `${CI_STACK_NAME}-github-actions`,
			assumedBy: new IAM.WebIdentityPrincipal(
				ghProvider.openIdConnectProviderArn,
				{
					StringEquals: {
						'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
					},
					StringLike: {
						[`${githubDomain}:sub`]: `repo:${r.owner}/${r.repo}:ref:refs/heads/*`,
					},
				},
			),
			description: `This role is used by GitHub Actions for CI of ${r.owner}/${r.repo}`,
			maxSessionDuration: Duration.hours(1),
			managedPolicies: [
				IAM.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
			],
		})

		new CfnOutput(this, 'roleArn', {
			exportName: `${this.stackName}:roleArn`,
			description: 'Role to use in GitHub Actions',
			value: ghRole.roleArn,
		})
	}
}

export type StackOutputs = {
	roleArn: string
}
