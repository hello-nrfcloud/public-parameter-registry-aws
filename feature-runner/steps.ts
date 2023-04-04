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
import { type World } from './run-features'

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
				const res = await (await fetch(match?.groups?.url ?? '')).json()
				debug(res)
				check(res).is(objectMatching(JSON.parse(codeBlockOrThrow(step).code)))
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
