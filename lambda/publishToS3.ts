import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { SSMClient } from '@aws-sdk/client-ssm'
import { getSettings } from './settings.js'

const stackName = process.env.STACK_NAME ?? ''
const prefix = `/${stackName}/public/`
const bucketName = process.env.BUCKET_NAME ?? ''

const ssm = new SSMClient({})
const s3 = new S3Client({})

export const handler = async (event: {
	version: string // '0'
	id: string // '0e858064-ebc2-76ea-0f39-3dea4e896e64'
	'detail-type': string // 'Parameter Store Change'
	source: string // 'aws.ssm'
	account: string // '777112256734'
	time: string // '2023-03-31T05:53:22Z'
	region: string // 'eu-central-1'
	resources: string[] // ['arn:aws:ssm:eu-central-1:777112256734:parameter/public-parameter-registry/public/some-parameter']
	detail: {
		name: string // '/public-parameter-registry/public/some-parameter'
		type: string // 'String'
		operation: string // 'Create', 'Update
	}
}): Promise<void> => {
	console.log(JSON.stringify({ event }))
	const parameterName = event.detail.name
	if (!parameterName.startsWith(prefix)) {
		console.debug(`Updated parameter is not under ${prefix}.`)
		return
	}

	const registry = await getSettings({ ssm, stackName })

	const json = {
		'@ts': new Date().toISOString(),
		'@version': '1',
		'@context': 'https://github.com/bifravst/public-parameter-registry-aws-js',
		...registry,
	}
	console.log(JSON.stringify({ json }, null, 2))

	await s3.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: 'registry.json',
			Body: JSON.stringify(json, null, 2),
			CacheControl: 'public,max-age=600',
			ContentType: 'application/json',
		}),
	)
}
