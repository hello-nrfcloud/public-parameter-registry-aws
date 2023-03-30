import {
	consoleReporter,
	type SuiteResult,
} from '@nordicsemiconductor/bdd-markdown'

const chunks: string[] = []

process.stdin.on('data', (data) => {
	chunks.push(data.toString())
})

process.stdin.on('end', () => {
	const report: SuiteResult = JSON.parse(chunks.join(''))
	consoleReporter(report, console.log)
	if (!report.ok) process.exit(1)
})
