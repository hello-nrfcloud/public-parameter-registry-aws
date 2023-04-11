import { check, objectMatching } from 'tsmatchers'

check({
	'@context': 'https://github.com/bifravst/public-parameter-registry-aws-js',
	'@ts': '2023-03-31T12:14:28.363Z',
	'@version': 1,
	'some-parameter': 'Some Value 2',
	aStringParameter: 'someValue',
	example: {
		aNumberParameter: 42,
	},
}).is(
	objectMatching({
		aStringParameter: 'someValue',
		example: {
			aNumberParameter: 42,
		},
	}),
)
