import { App } from 'aws-cdk-lib'
import type { RegistryLambdas } from './RegistryLambdas.js'
import { RegistryStack } from './RegistryStack.js'

export class RegistryApp extends App {
	public constructor({ lambdaSources }: { lambdaSources: RegistryLambdas }) {
		super()

		new RegistryStack(this, {
			lambdaSources,
		})
	}
}
