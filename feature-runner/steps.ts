import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
	DeleteParameterCommand,
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
import { randomUUID } from 'node:crypto'
import { check, not, objectMatching, objectWithKeys } from 'tsmatchers'
import { type World } from './run-features.js'
export const steps = ({
	ssm,
}: {
	ssm: SSMClient
}): { steps: StepRunner<World>[]; cleanup: () => Promise<void> } => {
	let Names: string[] = []
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
				const value = match.groups?.value ?? ''
				debug(`${Name}: ${value}`)
				await ssm.send(
					new PutParameterCommand({
						Name,
						Value: `${value}`,
						Type: ParameterType.STRING,
						Overwrite: true,
					}),
				)
				Names.push(Name)
			},
			async ({
				step,
				context,
				log: {
					step: { debug },
				},
			}: StepRunnerArgs<World>): Promise<StepRunResult> => {
				const match =
					/^a random (?<type>string|number) is stored in `(?<storageName>[^`]+)`$/.exec(
						step.title,
					)
				if (match === null) return noMatch
				const value =
					match.groups?.type === 'string'
						? randomUUID()
						: Math.floor(Math.random() * 1000000)
				context[match.groups?.storageName ?? ''] = value
			},
			async ({
				step,
				context,
				log: {
					step: { debug },
				},
			}: StepRunnerArgs<World>): Promise<StepRunResult> => {
				const match = /^`(?<name>[^`]+)` is deleted$/.exec(step.title)
				if (match === null) return noMatch
				const Name = `/${context.stackName}/public/${match.groups?.name}`
				debug(Name)
				await ssm.send(
					new DeleteParameterCommand({
						Name,
					}),
				)
				Names = Names.filter((n) => n !== Name)
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
			async ({
				step,
				log: {
					step: { debug },
				},
			}: StepRunnerArgs<World>): Promise<StepRunResult> => {
				const match =
					/^the S3 file `(?<s3Url>[^`]+)` should not have property `(?<property>[^`]+)`$/.exec(
						step.title,
					)
				if (match === null) return noMatch
				const [bucket, file] = (match.groups?.s3Url ?? '').split('/')
				const res = await new S3Client({}).send(
					new GetObjectCommand({
						Bucket: bucket,
						Key: file,
					}),
				)
				const body = (await res.Body?.transformToString()) ?? ''
				debug(body)
				let registry: Record<string, any> = {}
				try {
					registry = JSON.parse(body)
				} catch {
					throw new Error(`Failed to parse body as JSON: ${body}`)
				}
				check(registry).is(not(objectWithKeys(match.groups?.property ?? '')))
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
