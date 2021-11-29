import { TextSelection } from '../../editor/model/Selection';
import { wrap } from '../commands/wrap';
import { Editor } from '../../editor/model/Editor';

export const getCommandList = ({ editor }: { editor: Editor }) => [
    {
        label: 'Turn in Heading 1',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;

            editor
                .createTransaction()
                .patch({
                    nodeId,
                    patch: editor.schema.heading.patch({
                        ...editor.state.nodes[nodeId],
                        attrs: { level: 1 },
                    }),
                })
                .dispatch();
        },
    },
    {
        label: 'Turn in Heading 2',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .patch({
                    nodeId,
                    patch: editor.schema.heading.patch({
                        ...editor.state.nodes[nodeId],
                        attrs: { level: 2 },
                    }),
                })
                .dispatch();
        },
    },
    {
        label: 'Turn in text',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .patch({
                    nodeId,
                    patch: editor.schema.text.patch({
                        ...editor.state.nodes[nodeId],
                    }),
                })
                .dispatch();
        },
    },
    {
        label: 'Turn in a Quote',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(
                wrap({
                    nodeId,
                    wrappingNode: editor.schema.quote.create(),
                })
            );
        },
    },
    {
        label: 'Turn in a Callout',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(
                wrap({
                    nodeId,
                    wrappingNode: editor.schema.callout.create(),
                })
            );
        },
    },
];
