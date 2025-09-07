import type { Edit, SgRoot } from '@codemod.com/jssg-types/main';
import type Yaml from 'codemod:ast-grep/langs/yaml';

function transform(root: SgRoot<Yaml>): string | undefined {
	const rootNode = root.root();
	const edits: Edit[] = [];

	const specBlocks = rootNode.findAll({
		rule: {
			kind: 'block_node',
			has: {
				kind: 'block_mapping',
				has: {
					kind: 'block_mapping_pair',
					has: {
						field: 'key',
						kind: 'flow_node',
						regex: 'spec',
					},
				},
			},
		},
	});

	for (const specBlock of specBlocks) {
		const inputOutputBlocks = specBlock.findAll({
			rule: {
				kind: 'block_mapping_pair',
				has: {
					kind: 'flow_node',
					field: 'key',
					has: {
						kind: 'plain_scalar',
						has: {
							kind: 'string_scalar',
							regex: 'inputs|outputs',
						},
					},
				},
			},
		});

		let firstBlock = null;
		const blocksToMerge: { key: string; value: string }[] = [];
		for (const block of inputOutputBlocks) {
			let value = block.text().split('\n').slice(1).join('\n');
			if (!firstBlock) {
				const newResourcesBlock = block.find({
					rule: {
						kind: 'string_scalar',
					},
				});

				if (newResourcesBlock)
					edits.push(newResourcesBlock.replace('resources'));

				firstBlock = block.find({
					rule: {
						kind: 'block_mapping_pair',
						has: {
							kind: 'flow_node',
							field: 'key',
							has: {
								kind: 'plain_scalar',
								has: {
									kind: 'string_scalar',
									regex: 'resources',
								},
							},
						},
					},
				});

				const _value = block.find({
					rule: {
						kind: 'block_mapping_pair',
						has: {
							kind: 'flow_node',
							field: 'key',
							has: {
								kind: 'plain_scalar',
								has: {
									kind: 'string_scalar',
									regex: 'resources',
								},
							},
						},
					},
				});

				if (_value) {
					value = _value.text();
				}
			}

			const key = block.find({
				rule: {
					kind: 'string_scalar',
				},
			});

			if (key && value) {
				blocksToMerge.push({
					key: key?.text(),
					value: value,
				});
			}

			if (firstBlock) {
				edits.push(block.replace(''));
			}
		}

		const newBlock = blocksToMerge.map((block) => {
			return block.value.replace('resources', block.key);
		});

		if (firstBlock) edits.push(firstBlock.replace(newBlock.join('\n')));
	}

	return rootNode.commitEdits(edits);
}

export default transform;
