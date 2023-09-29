import { type Parameter } from '@aws-sdk/client-ssm'

export const parameterTree = (
	parameters: Parameter[],
	prefix: string,
): Record<string, any> => {
	const prefixWithSlash = prefix.replace(/\/+$/, '') + '/'
	return parameters
		.filter(({ Name }) => Name?.startsWith(prefix))
		.map((param) => ({
			...param,
			Name: param.Name?.replace(prefixWithSlash, '') ?? '',
		}))
		.reduce(
			(tree, { Name, Value }) => {
				if (Value === undefined) return tree
				const parts: string[] = Name?.split('/') ?? []
				setRecursive(tree, parts, parseValue(Value))
				return tree
			},
			{} as Record<string, any>,
		)
}
const parseValue = (v: string): string | number =>
	/^[0-9]+(\.[0-9]+)?$/.test(v) ? parseFloat(v) : v
const setRecursive = (
	tree: Record<string, any>,
	nodes: string[],
	Value: unknown,
): void => {
	if (nodes.length === 1) {
		tree[nodes[0] as string] = Value
		return
	}
	const [parent, ...rest] = nodes as [string, ...string[]]
	if (tree[parent] === undefined) tree[parent] = {}
	setRecursive(tree[parent], rest, Value)
}
