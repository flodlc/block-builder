import { PluginFactory } from '../../editor/view/plugin/types';
import {
    isBlockSelection,
    isTextSelection,
} from '../../editor/model/Selection';
import { serializeNode } from '../../editor/model/serlializers/htmlSerializer';
import { insertHtml } from '../commands/insertHtml';

export const CopyPastePlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const pasteHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            let html = e.clipboardData?.getData?.('text/html');
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html ?? '';

            const htmlFromPlainText = e.clipboardData
                ?.getData?.('text/plain')
                ?.split(/\n/)
                .filter((item) => item)
                .reduce((acc, section) => acc + `<p>${section.trim()}</p>`, '');
            html = html || htmlFromPlainText;

            if (!html) return;
            insertHtml(html, editor);
        };

        const copyHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            if (!editor.state.selection) return;
            let html = '';
            if (isTextSelection(editor.state.selection)) {
                const nodeId = editor.state.selection.nodeId;
                html = serializeNode(
                    editor.schema,
                    editor.state.nodes[nodeId],
                    editor.state.nodes,
                    false,
                    editor.state.selection.range
                );
            } else if (isBlockSelection(editor.state.selection)) {
                const firstLevelNodeIds =
                    editor.state.selection.getFirstLevelBlockIds(editor.state);
                html = Array.from(firstLevelNodeIds.values()).reduce(
                    (acc, nodeId) => {
                        return (
                            acc +
                            serializeNode(
                                editor.schema,
                                editor.state.nodes[nodeId],
                                editor.state.nodes,
                                true
                            )
                        );
                    },
                    ''
                );
            }
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            e.clipboardData?.setData('text/html', wrapper.innerHTML);
            e.clipboardData?.setData('text/plain', wrapper.textContent ?? '');
        };

        dom.addEventListener('paste', pasteHandler);
        document.addEventListener('copy', copyHandler);
        return {
            key: 'copyPaste',
            destroy() {
                dom.removeEventListener('paste', pasteHandler);
                document.removeEventListener('copy', copyHandler);
            },
        };
    };
