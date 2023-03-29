import pJSON from '../package.json'
import { CIApp } from './CIApp.js'

const repoUrl = new URL(pJSON.repository.url)
const repository = {
	owner: repoUrl.pathname.split('/')[1] ?? 'bifravst',
	repo:
		repoUrl.pathname.split('/')[2]?.replace(/\.git$/, '') ??
		'public-parameter-registry-aws-js',
}
new CIApp({ repository })
