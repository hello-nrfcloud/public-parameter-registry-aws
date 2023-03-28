import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { runFolder } from '@nordicsemiconductor/bdd-markdown'
import { stackOutput } from '@nordicsemiconductor/cloudformation-helpers'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { StackOutputs as BackendStackOutputs } from '../cdk/RegistryStack.js'
import { STACK_NAME } from '../cdk/stackConfig.js'

/**
 * This file configures the BDD Feature runner
 * by loading the configuration for the test resources
 * (like AWS services) and providing the required
 * step runners and reporters.
 */

const config = await stackOutput(
	new CloudFormationClient({}),
)<BackendStackOutputs>(STACK_NAME)

const tenantId = randomUUID()
export type World = {}

const runner = await runFolder<World>({
	folder: path.join(process.cwd(), 'features'),
	name: 'Public Parameter Registry',
})

const res = await runner.run({
	websocketUri: config.webSocketURI,
	devicesTable: config.devicesTable,
	websocketQueueUri: config.webSocketQueueURI,
	tenantId,
})

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
