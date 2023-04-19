import {
	DeleteParametersCommand,
	ParameterType,
	PutParameterCommand,
	SSMClient,
} from '@aws-sdk/client-ssm'
import {
	codeBlockOrThrow,
	noMatch,
	type StepRunResult,
	type StepRunner,
	type StepRunnerArgs,
} from '@nordicsemiconductor/bdd-markdown'
import { check, objectMatching } from 'tsmatchers'
import { type World } from './run-features.js'

export const steps = ({
	ssm,
}: {
	ssm: SSMClient
}): { steps: StepRunner<World>[]; cleanup: () => Promise<void> } => {
	const Names: string[] = []
	return {
		steps: [
			async ({
				step,
				context,
				log: {
					step: { debug },
				},
			}: StepRunnerArgs<World>): Promise<StepRunResult> => {
				const match = /^`(?<value>[^`]+)` is stored in `(?<name>[^`]+)`$/.exec(
					step.title,
				)
				if (match === null) return noMatch
				const Name = `/${context.stackName}/public/${match.groups?.name}`
				debug(Name)
				await ssm.send(
					new PutParameterCommand({
						Name,
						Value: match.groups?.value ?? '',
						Type: ParameterType.STRING,
						Overwrite: true,
					}),
				)
				Names.push(Name)
			},
			async ({
				step,
				log: {
					step: { debug },
				},
			}: StepRunnerArgs<World>): Promise<StepRunResult> => {
				const match =
					/^the result of GET `(?<url>[^`]+)` should match this JSON$/.exec(
						step.title,
					)
				if (match === null) return noMatch
				const res = await fetch(match?.groups?.url ?? '')
				res.headers.forEach((v, k) => debug(`${k}: ${v}`))
				const body = await res.text()
				debug(body)
				let registry: Record<string, any> = {}
				try {
					registry = JSON.parse(body)
				} catch {
					throw new Error(`Failed to parse body as JSON: ${body}`)
				}
				check(registry).is(
					objectMatching(JSON.parse(codeBlockOrThrow(step).code)),
				)
				return registry
			},
		],
		cleanup: async () => {
			if (Names.length === 0) return
			await ssm.send(
				new DeleteParametersCommand({
					Names,
				}),
			)
		},
	}
}
