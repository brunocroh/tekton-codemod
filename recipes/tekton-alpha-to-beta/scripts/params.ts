import type { Edit, SgRoot } from '@codemod.com/jssg-types/main';
import type Yaml from 'codemod:ast-grep/langs/yaml';

function updateCodeIdentation(
	sourceCode: string,
	identationOffset: number,
): string {
	const lines = sourceCode.split('\n');
	const newLines = [];
	const space = ' ';
	const offset = space.repeat(Math.abs(identationOffset));

	for (const line of lines) {
		if (identationOffset < 0) {
			let _line = line;
			if (line.startsWith(offset)) {
				_line = line.replace(offset, '');
			}

			newLines.push(_line);
		}
	}

	return newLines.join('\n');
}

function transform(root: SgRoot<Yaml>): string | undefined {
	const rootNode = root.root();
	const edits: Edit[] = [];

	const inputsBlock = rootNode.findAll({
		rule: {
			kind: 'block_node',
			has: {
				kind: 'block_mapping',
				has: {
					kind: 'block_mapping_pair',
					has: {
						field: 'key',
						kind: 'flow_node',
						regex: 'inputs',
					},
				},
			},
		},
	});

	for (const inputBlock of inputsBlock) {
		const paramsBlock = inputBlock.find({
			rule: {
				kind: 'block_node',
				has: {
					kind: 'block_mapping',
					has: {
						kind: 'block_mapping_pair',
						has: {
							field: 'key',
							kind: 'flow_node',
							regex: 'params',
						},
					},
				},
			},
		});

		if (!paramsBlock) continue;
		const identationOffset =
			inputBlock?.range().start.column - paramsBlock.range().start.column;

		edits.push(
			inputBlock.replace(
				updateCodeIdentation(paramsBlock.text(), identationOffset),
			),
		);
	}

	return rootNode.commitEdits(edits);
}

export default transform;
