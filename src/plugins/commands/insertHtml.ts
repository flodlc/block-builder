import {
    Editor,
    AbstractSelection,
    BlockSelection,
    TextSelection,
    Node,
    TransactionBuilder,
} from '../../indexed';

export const insertHtml = (html: string, editor: Editor) => {
    const parsed = editor.parseHtml(html);
    if (!editor.selection) return;

    insertLines({
        editor,
        selection: editor.selection,
        blockIds: parsed.blockIds as string[],
        nodes: parsed.nodes,
    });
};

const insertLines = ({
    editor,
    selection,
    blockIds,
    nodes,
}: {
    editor: Editor;
    selection: AbstractSelection;
    blockIds: string[];
    nodes: Record<string, Node>;
}) => {
    if (!selection?.isText()) return;
    const textSelection = selection as TextSelection;

    const node = editor.getNode(textSelection.nodeId);
    if (!node) return;
    const firstBlock = nodes[blockIds[0]];
    if (
        blockIds.length === 1 &&
        firstBlock.text?.length &&
        !firstBlock.childrenIds?.length
    ) {
        editor
            .createTransaction()
            .patch({
                nodeId: node.id,
                patch: {
                    text: Node.joinMarkedTexts(
                        Node.copyText(node.text, [0, textSelection.range[0]]),
                        firstBlock.text,
                        blockIds.length === 1
                            ? Node.copyText(node.text, [textSelection.range[1]])
                            : undefined
                    ),
                },
            })
            .focus(
                new TextSelection(node.id, [0, 0]).setCollapsedRange(
                    textSelection.range[0] + firstBlock.getTextLength()
                )
            )
            .dispatch();
        return;
    }

    const parentId = editor.getParentId(textSelection.nodeId) ?? editor.rootId;

    const tr = editor.createTransaction();
    blockIds?.forEach((blockId, i) => {
        insertLine(tr, blockId, nodes, parentId, blockIds[i - 1] ?? node.id);
    });
    getSelection()?.removeAllRanges();
    if (!node.text?.length) {
        tr.removeFrom({ nodeId: node.id, parentId });
    }

    tr.focus(new BlockSelection(blockIds)).dispatch();
};

const insertLine = (
    tr: TransactionBuilder,
    blockId: string,
    nodes: Record<string, Node>,
    parentId: string,
    prev?: string
) => {
    const node = nodes[blockId];
    tr.insertAfter({
        node: node.patch({ childrenIds: [] }),
        parentId,
        after: prev,
    });
    node.childrenIds?.forEach((id, i) => {
        insertLine(tr, id, nodes, node.id, node?.childrenIds?.[i - 1]);
    });
};
