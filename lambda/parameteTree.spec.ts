import { parameterTree } from './parameterTree.js'
import { describe, test as it } from 'node:test'
import { check, objectMatching } from 'tsmatchers'

void describe('parameterTree()', () => {
	void it('should create a tree structure from the given SSM parameters', () => {
		check(
			parameterTree(
				[
					{
						ARN: 'arn:aws:ssm:eu-central-1:777112256734:parameter/public-parameter-registry/public/aStringParameter',
						DataType: 'text',
						LastModifiedDate: new Date('2023-03-31T09:08:07.970Z'),
						Name: '/public-parameter-registry/public/aStringParameter',
						Type: 'String',
						Value: 'someValue',
						Version: 1,
					},
					{
						ARN: 'arn:aws:ssm:eu-central-1:777112256734:parameter/public-parameter-registry/public/example/aNumberParameter',
						DataType: 'text',
						LastModifiedDate: new Date('2023-03-31T09:08:08.057Z'),
						Name: '/public-parameter-registry/public/example/aNumberParameter',
						Type: 'String',
						Value: '42',
						Version: 1,
					},
					{
						ARN: 'arn:aws:ssm:eu-central-1:777112256734:parameter/public-parameter-registry/public/some-parameter',
						DataType: 'text',
						LastModifiedDate: new Date('2023-03-31T08:13:23.967Z'),
						Name: '/public-parameter-registry/public/some-parameter',
						Type: 'String',
						Value: 'Some Value 2',
						Version: 4,
					},
				],
				'/public-parameter-registry/public',
			),
		).is(
			objectMatching({
				aStringParameter: 'someValue',
				['some-parameter']: 'Some Value 2',
				example: {
					aNumberParameter: 42,
				},
			}),
		)
	})
})
