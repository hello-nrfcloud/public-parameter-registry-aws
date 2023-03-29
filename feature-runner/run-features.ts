import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { runFolder } from '@nordicsemiconductor/bdd-markdown'
import { stackOutput } from '@nordicsemiconductor/cloudformation-helpers'
import path from 'node:path'
import type { StackOutputs } from '../cdk/RegistryStack.js'
import { STACK_NAME } from '../cdk/stackConfig.js'

/**
 * This file configures the BDD Feature runner
 * by loading the configuration for the test resources
 * (like AWS services) and providing the required
 * step runners and reporters.
 */

const config = await stackOutput(new CloudFormationClient({}))<StackOutputs>(
	STACK_NAME,
)

export type World = {
	registryEndpoint: string
}

const runner = await runFolder<World>({
	folder: path.join(process.cwd(), 'features'),
	name: 'Public Parameter Registry',
})

const res = await runner.run({
	registryEndpoint: config.registryEndpoint,
})

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
