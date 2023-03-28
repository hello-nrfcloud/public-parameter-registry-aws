import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { RegistryApp } from './RegistryApp.js'
import { packLambda } from './packLambda.js'
import { packLayer } from './packLayer.js'

export type PackedLambda = { lambdaZipFile: string; handler: string }

const packagesInLayer: string[] = ['@nordicsemiconductor/from-env']
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
	layer: await packLayer({
		id: 'baseLayer',
		dependencies: packagesInLayer,
	}),
})
