import { TextSelection } from '../../indexed';
import { Editor } from '../../indexed';
import { insertHtml } from '../commands/insertHtml';
import { wrapIn } from '../commands/wrapIn';

export const getCommandList = ({ editor }: { editor: Editor }) => [
    {
        label: 'Insert html',
        callback: () => {
            const html = prompt('paste your html here');
            if (!html) return;
            insertHtml(`<blockquote>${html}</blockquote>`, editor);
        },
    },
    {
        label: 'Turn in Image',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .patch({
                    nodeId,
                    patch: {
                        type: 'image',
                        attrs: {
                            src: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600',
                        },
                    },
                })
                .dispatch();
        },
    },
    {
        label: 'Turn in Heading 1',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .patch({
                    nodeId,
                    patch: {
                        type: 'heading',
                        attrs: {
                            level: 1,
                        },
                    },
                })
                .dispatch();
        },
    },
    {
        label: 'Turn in Toggle List',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .patch({
                    nodeId,
                    patch: {
                        type: 'toggleList',
                    },
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
                    patch: {
                        type: 'heading',
                        attrs: {
                            level: 2,
                        },
                    },
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
                    patch: {
                        type: 'text',
                    },
                })
                .dispatch();
        },
    },
    {
        label: 'Turn in a Quote',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .pipe(wrapIn({ editor, nodeId, type: 'quote' }))
                .dispatch();
        },
    },
    {
        label: 'Turn in a Callout',
        callback: () => {
            const selection = editor.state.selection as TextSelection;
            const nodeId = selection.nodeId;
            editor
                .createTransaction()
                .pipe(wrapIn({ editor, nodeId, type: 'callout' }))
                .dispatch();
        },
    },
];
