import { App } from 'aws-cdk-lib'
import type { RegistryLambdas } from './RegistryLambdas.js'
import { RegistryStack } from './RegistryStack.js'

export class RegistryApp extends App {
	public constructor({
		lambdaSources,
		repository,
		gitHubOICDProviderArn,
		version,
	}: {
		lambdaSources: RegistryLambdas
		repository: Repository
		gitHubOICDProviderArn: string
		version: string
	}) {
		super({
			context: {
				version,
			},
		})

		new RegistryStack(this, {
			lambdaSources,
			repository,
			gitHubOICDProviderArn,
		})
	}
}
