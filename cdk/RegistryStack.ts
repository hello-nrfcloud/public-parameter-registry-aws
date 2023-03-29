import { App, CfnOutput, Stack } from 'aws-cdk-lib'
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

		new CfnOutput(this, 'registryEndpoint', {
			exportName: `${this.stackName}:registryEndpoint`,
			description: 'Endpoint used for fetch the parameters',
			value: '', // FIXME,
		})
	}
}

export type StackOutputs = {
	registryEndpoint: string
}
