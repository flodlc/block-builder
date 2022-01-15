import {
    Editor,
    AbstractSelection,
    BlockSelection,
    TextSelection,
    Node,
    TransactionBuilder,
    cutMarkedText,
    joinMarkedTexts,
    getMarkedTextLength,
} from '../../indexed';

export const insertHtml = (html: string, editor: Editor) => {
    const parsed = editor.parseHtml(html);
    if (!editor.state.selection) return;

    insertLines({
        editor,
        selection: editor.state.selection,
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

    const node = editor.state.nodes[textSelection.nodeId];
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
                    text: joinMarkedTexts(
                        cutMarkedText(node.text, [0, textSelection.range[0]]),
                        firstBlock.text,
                        blockIds.length === 1
                            ? cutMarkedText(node.text, [textSelection.range[1]])
                            : undefined
                    ),
                },
            })
            .focus(
                new TextSelection(node.id, [0, 0]).setCollapsedRange(
                    textSelection.range[0] +
                        getMarkedTextLength(firstBlock.text ?? [])
                )
            )
            .dispatch();
        return;
    }

    let parentId = editor.runQuery(
        (resolvedState) =>
            resolvedState.nodes[textSelection.nodeId]?.parentId as string
    );
    if (!parentId) parentId = editor.state.rootId;

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
        node: { ...node, childrenIds: [] },
        parentId,
        after: prev,
    });
    node.childrenIds?.forEach((id, i) => {
        insertLine(tr, id, nodes, node.id, node?.childrenIds?.[i - 1]);
    });
};
