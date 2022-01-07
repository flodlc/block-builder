import { PluginFactory } from '../../editor/view/plugin/types';
import { TextSelection } from '../../editor/model/Selection';
import { serializeNode } from './htmlSerializer';
import { insertHtml } from './insertHtml';

export const CopyPastePlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const pasteHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            const html = e.clipboardData?.getData?.('text/html');
            if (!html) return;
            insertHtml(html, editor);
        };

        const copyHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            const nodeId = (editor.state.selection as TextSelection).nodeId;
            const html = serializeNode(
                editor.schema,
                editor.state.nodes[nodeId],
                editor.state.nodes
            );
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            console.log(wrapper);
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
