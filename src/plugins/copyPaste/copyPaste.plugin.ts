import { PluginFactory } from '../../editor/view/plugin/types';
import { TextSelection } from '../../editor/model/Selection';
import { joinMarkedTexts } from '../../editor/transaction/MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from '../../editor/transaction/MarkedText/getMarkedTextLength';
import { Editor } from '../../editor/model/Editor';

export const CopyPastePlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const pasteHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            const html = e.clipboardData?.getData?.('text/html');
            if (!html) return;
            // parse(html);

            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            const text = wrapper.innerText;

            insertInline({ editor, text });
        };
        dom.addEventListener('paste', pasteHandler);
        return {
            key: 'copyPaste',
            destroy() {
                dom.removeEventListener('paste', pasteHandler);
            },
        };
    };

const insertInline = ({ editor, text }: { editor: Editor; text: string }) => {
    const selection = editor.state.selection as TextSelection;
    if (!selection.isText()) return;

    const newText = joinMarkedTexts(editor.state.nodes[selection.nodeId].text, [
        { s: text },
    ]);
    const newTextLength = getMarkedTextLength(newText);

    editor
        .createTransaction()
        .patch({
            patch: {
                text: joinMarkedTexts(
                    editor.state.nodes[selection.nodeId].text,
                    [{ s: text }]
                ),
            },
            nodeId: selection.nodeId,
        })
        .focus(selection.setRange([newTextLength, newTextLength]))
        .dispatch();
};
