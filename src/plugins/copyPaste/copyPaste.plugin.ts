import { Editor, PluginFactory } from '../../indexed';
import { isBlockSelection, isTextSelection } from '../../indexed';
import { insertHtml } from '../commands/insertHtml';

export const CopyPastePlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const pasteHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            let html = e.clipboardData?.getData?.('text/html');

            if (!html) {
                const plainText = e.clipboardData?.getData?.('text/plain');
                html = parsePlainText(plainText);
            }

            if (!html) return;
            insertHtml(html, editor);
        };

        const copyHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            if (!editor.selection) return;
            let html = '';
            if (isTextSelection(editor.selection)) {
                const node = editor.getNode(editor.selection.nodeId);
                if (!node) return;
                html = editor.serializeNode(
                    node,
                    false,
                    editor.selection.range
                );
            } else if (isBlockSelection(editor.selection)) {
                const firstLevelNodeIds = getFirstLevelBlockIds(
                    editor,
                    editor.selection.nodeIds
                );
                html = Array.from(firstLevelNodeIds.values()).reduce(
                    (acc, nodeId) => {
                        const node = editor.getNode(nodeId);
                        if (!node) return acc;
                        return acc + editor.serializeNode(node, true);
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

const parsePlainText = (text = '') =>
    text
        ?.split(/\n/)
        .filter((item) => item)
        .reduce((acc, section) => acc + `<p>${section.trim()}</p>`, '');

const getFirstLevelBlockIds = (
    editor: Editor,
    nodeIds: Map<string, string>
) => {
    const selected = new Map<string, string>();
    Array.from(nodeIds.values()).forEach((nodeId) => {
        const parentId = editor.getParentId(nodeId);
        if (parentId && selected.get(parentId)) return;
        selected.set(nodeId, nodeId);
    });
    return selected;
};
