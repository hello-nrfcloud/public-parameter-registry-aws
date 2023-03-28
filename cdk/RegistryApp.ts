import { App } from 'aws-cdk-lib'
import type { RegistryLambdas } from './RegistryLambdas.js'
import { RegistryStack } from './RegistryStack.js'
import type { PackedLayer } from './packLayer.js'

export class RegistryApp extends App {
	public constructor({
		lambdaSources,
		layer,
	}: {
		lambdaSources: RegistryLambdas
		layer: PackedLayer
		iotEndpoint: string
	}) {
		super()

		new RegistryStack(this, {
			lambdaSources,
			layer,
		})
	}
}
