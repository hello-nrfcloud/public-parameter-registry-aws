import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import { SSMClient } from '@aws-sdk/client-ssm'
import { runFolder } from '@nordicsemiconductor/bdd-markdown'
import { stackOutput } from '@nordicsemiconductor/cloudformation-helpers'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { StackOutputs } from '../cdk/RegistryStack.js'
import { STACK_NAME } from '../cdk/stackConfig.js'
import { steps } from './steps.js'

const config = await stackOutput(new CloudFormationClient({}))<StackOutputs>(
	STACK_NAME,
)

export type World = {
	registryEndpoint: string
	stackName: string
	randomString: string
	randomNumber: number
}

const runner = await runFolder<World>({
	folder: path.join(process.cwd(), 'features'),
	name: 'Public Parameter Registry',
})

const stepDefs = steps({ ssm: new SSMClient({}) })
runner.addStepRunners(...stepDefs.steps)

const res = await runner.run({
	registryEndpoint: config.registryEndpoint,
	stackName: STACK_NAME,
	randomNumber: Math.floor(Math.random() * 1000000),
	randomString: randomUUID(),
})

await stepDefs.cleanup()

console.log(JSON.stringify(res, null, 2))

if (!res.ok) process.exit(1)
