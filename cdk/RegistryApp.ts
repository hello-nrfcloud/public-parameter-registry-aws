import { App } from 'aws-cdk-lib'
import type { RegistryLambdas } from './RegistryLambdas.ts'
import { RegistryStack } from './RegistryStack.ts'

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
