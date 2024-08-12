import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { SSMClient } from '@aws-sdk/client-ssm'
import {
	DeleteParameterCommand,
	DeleteParametersCommand,
	ParameterType,
	PutParameterCommand,
} from '@aws-sdk/client-ssm'
import {
	codeBlockOrThrow,
	regExpMatchedStep,
	type StepRunner,
} from '@bifravst/bdd-markdown'
import { Type } from '@sinclair/typebox'
import { randomUUID } from 'node:crypto'
import pRetry from 'p-retry'
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
			regExpMatchedStep(
				{
					regExp: /^`(?<value>[^`]+)` is stored in `(?<name>[^`]+)`$/,
					schema: Type.Object({
						value: Type.String({ minLength: 1 }),
						name: Type.String({ minLength: 1 }),
					}),
				},
				async ({ context, log: { debug }, match: { name, value } }) => {
					const Name = `/${context.stackName}/public/${name}`
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
			),
			regExpMatchedStep(
				{
					regExp:
						/^a random (?<type>string|number) is stored in `(?<storageName>[^`]+)`$/,
					schema: Type.Object({
						type: Type.Union([Type.Literal('string'), Type.Literal('number')]),
						storageName: Type.String({ minLength: 1 }),
					}),
				},
				async ({ match: { type, storageName }, context }) => {
					const value =
						type === 'string'
							? randomUUID()
							: Math.floor(Math.random() * 1000000)
					context[storageName ?? ''] = value
				},
			),
			regExpMatchedStep(
				{
					regExp: /^`(?<name>[^`]+)` is deleted$/,
					schema: Type.Object({
						name: Type.String({ minLength: 1 }),
					}),
				},
				async ({ match: { name }, context, log: { debug } }) => {
					const Name = `/${context.stackName}/public/${name}`
					debug(Name)
					await ssm.send(
						new DeleteParameterCommand({
							Name,
						}),
					)
					Names = Names.filter((n) => n !== Name)
				},
			),
			regExpMatchedStep(
				{
					regExp: /^the result of GET `(?<url>[^`]+)` should match this JSON$/,
					schema: Type.Object({
						url: Type.String({ minLength: 1 }),
					}),
				},
				async ({ match: { url }, step, log: { debug } }) => {
					await pRetry(
						async () => {
							const res = await fetch(url ?? '')
							check(res.ok).is(true)
							res.headers.forEach((v, k) => debug(`${k}: ${v}`))
							const body = await res.text()
							debug(body)
							let result: Record<string, any> = {}
							try {
								result = JSON.parse(body)
							} catch {
								throw new Error(`Failed to parse body as JSON: ${body}`)
							}
							check(result).is(
								objectMatching(JSON.parse(codeBlockOrThrow(step).code)),
							)
						},
						{
							retries: 5,
							minTimeout: 5000,
							factor: 1.5,
						},
					)
				},
			),
			regExpMatchedStep(
				{
					regExp:
						/^the S3 file `(?<s3Url>[^`]+)` should not have property `(?<property>[^`]+)`$/,
					schema: Type.Object({
						s3Url: Type.String({ minLength: 1 }),
						property: Type.String({ minLength: 1 }),
					}),
				},
				async ({ match: { s3Url, property }, log: { debug } }) => {
					await pRetry(
						async () => {
							const [bucket, file] = (s3Url ?? '').split('/')
							const res = await new S3Client({}).send(
								new GetObjectCommand({
									Bucket: bucket,
									Key: file,
								}),
							)
							const body = (await res.Body?.transformToString()) ?? ''
							debug(body)
							let result: Record<string, any> = {}
							try {
								result = JSON.parse(body)
							} catch {
								throw new Error(`Failed to parse body as JSON: ${body}`)
							}
							check(result).is(not(objectWithKeys(property ?? '')))
						},
						{
							retries: 5,
							minTimeout: 5000,
							factor: 1.5,
						},
					)
				},
			),
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
