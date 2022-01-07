import { Editor } from '../../editor/model/Editor';
import { parseHtml } from './htmlParser';
import { BlockSelection, TextSelection } from '../../editor/model/Selection';
import { Node } from '../../editor/model/types';
import { TransactionBuilder } from '../../editor/transaction/TransactionBuilder';

export const insertHtml = (html: string, editor: Editor) => {
    const parsed = parseHtml({ html, schema: editor.schema });
    console.log(parsed);
    const selection = editor.state.selection as TextSelection;
    const tr = editor.createTransaction();

    if (parsed?.type === 'inline') {
        console.log(parsed);
        return;
    }

    const parsedLines = parsed as {
        type: string;
        blocks: Node[];
        nodes: Record<string, Node>;
    };

    const { parentId } = editor.runQuery((resolvedState) => ({
        parentId: resolvedState.nodes[selection.nodeId]?.parentId as string,
        prevId: resolvedState.nodes[selection.nodeId]?.previousId as string,
    }));

    parsedLines?.blocks?.forEach((block, i) => {
        insertLine(
            tr,
            block,
            parsedLines.nodes,
            parentId,
            parsedLines.blocks[i - 1]?.id ?? selection.nodeId
        );
    });
    getSelection()?.removeAllRanges();
    tr.focus(new BlockSelection(parsedLines?.blocks.map((item) => item.id)))
        .removeFrom({ parentId, nodeId: selection.nodeId })
        .dispatch();
};

const insertLine = (
    tr: TransactionBuilder,
    node: Node,
    nodes: Record<string, Node>,
    parentId: string,
    prev?: string
) => {
    tr.insertAfter({
        node: { ...node, childrenIds: [] },
        parent: parentId,
        after: prev,
    });
    node.childrenIds?.forEach((id, i) => {
        const childNode = nodes[id];
        insertLine(tr, childNode, nodes, node.id, node?.childrenIds?.[i - 1]);
    });
};
