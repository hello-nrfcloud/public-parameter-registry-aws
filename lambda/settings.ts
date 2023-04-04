import {
	GetParametersByPathCommand,
	SSMClient,
	type Parameter,
} from '@aws-sdk/client-ssm'
import { paginate } from './paginate.js'
import { parameterTree } from './parameterTree.js'

export const settingsPath = ({ stackName }: { stackName: string }): string =>
	`/${stackName}/public`

export const getSettings = async ({
	ssm,
	stackName,
}: {
	ssm: SSMClient
	stackName: string
}): Promise<Record<string, any>> => {
	const Path = settingsPath({ stackName })
	const Parameters: Parameter[] = []
	await paginate({
		paginator: async (NextToken?: string) =>
			ssm
				.send(
					new GetParametersByPathCommand({
						Path,
						Recursive: true,
						NextToken,
					}),
				)

				.then(async ({ Parameters: p, NextToken }) => {
					if (p !== undefined) Parameters.push(...p)
					return NextToken
				}),
	})

	return parameterTree(Parameters, Path)
}
