import { InputRule, TextSelection } from '../../editor/view/types';
import { insertMention } from './insertMention.command';

export const mentionInputRules: InputRule[] = [
    {
        regex: [/ (@)$/, /^(@)$/],
        callback: (editor, result) => {
            const nodeId = Object.keys(editor.state.selection.blockIds)[0];
            const nodeSelection = editor.state.selection.blockIds[
                nodeId
            ] as TextSelection;
            const regexSelection = {
                blockIds: {
                    [nodeId]: {
                        ...nodeSelection,
                        from: nodeSelection.from - result[1].length,
                    },
                },
            };

            editor.runCommand(insertMention(regexSelection));
        },
    },
];
