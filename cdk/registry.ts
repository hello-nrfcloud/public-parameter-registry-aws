import { IAMClient } from '@aws-sdk/client-iam'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import pJSON from '../package.json'
import { RegistryApp } from './RegistryApp.js'
import { ensureGitHubOIDCProvider } from './ensureGitHubOIDCProvider.js'
import { packLambda } from './packLambda.js'

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'bifravst',
	repo:
		repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ??
		'public-parameter-registry-aws-js',
}
const version = process.env.VERSION ?? pJSON.version

export type PackedLambda = { lambdaZipFile: string; handler: string }

const pack = async (id: string, handler = 'handler'): Promise<PackedLambda> => {
	try {
		await mkdir(path.join(process.cwd(), 'dist', 'lambdas'), {
			recursive: true,
		})
	} catch {
		// Directory exists
	}
	const zipFile = path.join(process.cwd(), 'dist', 'lambdas', `${id}.zip`)
	await packLambda({
		sourceFile: path.join(process.cwd(), 'lambda', `${id}.ts`),
		zipFile,
	})
	return {
		lambdaZipFile: zipFile,
		handler: `${id}.${handler}`,
	}
}

new RegistryApp({
	lambdaSources: {
		publishToS3: await pack('publishToS3'),
	},
	repository,
	gitHubOICDProviderArn: await ensureGitHubOIDCProvider({
		iam: new IAMClient({}),
	}),
	version,
})
