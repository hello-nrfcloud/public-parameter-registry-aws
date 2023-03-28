import { App, CfnOutput, aws_lambda as Lambda, Stack } from 'aws-cdk-lib'
import { RegistryLambdas } from './RegistryLambdas.js'
import type { PackedLayer } from './packLayer.js'
import { STACK_NAME } from './stackConfig.js'

export class RegistryStack extends Stack {
	public constructor(
		parent: App,
		{
			lambdaSources,
			layer,
		}: {
			lambdaSources: RegistryLambdas
			layer: PackedLayer
		},
	) {
		super(parent, STACK_NAME)

		const baseLayer = new Lambda.LayerVersion(this, 'baseLayer', {
			code: Lambda.Code.fromAsset(layer.layerZipFile),
			compatibleArchitectures: [Lambda.Architecture.ARM_64],
			compatibleRuntimes: [Lambda.Runtime.NODEJS_18_X],
		})

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
