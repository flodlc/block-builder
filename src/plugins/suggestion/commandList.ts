import { TextSelection } from '../../editor/model/Selection';
import { Editor } from '../../editor/model/Editor';
import { turnInCommand } from '../commands/turnIn.command';

export const getCommandList = ({ editor }: { editor: Editor }) => [
    {
        label: 'Turn in Heading 1',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(
                turnInCommand({ nodeId, type: 'heading', attrs: { level: 1 } })
            );
        },
    },
    {
        label: 'Turn in Heading 2',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(
                turnInCommand({ nodeId, type: 'heading', attrs: { level: 2 } })
            );
        },
    },
    {
        label: 'Turn in text',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(turnInCommand({ nodeId, type: 'text' }));
        },
    },
    {
        label: 'Turn in a Quote',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(turnInCommand({ nodeId, type: 'quote' }));
        },
    },
    {
        label: 'Turn in a Callout',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor.runCommand(turnInCommand({ nodeId, type: 'callout' }));
        },
    },
];
