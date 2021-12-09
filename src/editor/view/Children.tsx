import React, { useCallback, useContext, useEffect, useState } from 'react';
import { EditorContext } from './contexts/EditorContext';
import { ViewContext } from './contexts/ViewContext';
import { AbstractSelection } from '../model/Selection';

export const Children = ({
    childrenIds,
    parentId,
}: {
    childrenIds?: string[];
    parentId: string;
}) => {
    return (
        <>
            {childrenIds &&
                childrenIds.map((childId) => (
                    <Child key={childId} parentId={parentId} nodeId={childId} />
                ))}
        </>
    );
};

const getSelection = ({
    nodeId,
    selection,
}: {
    nodeId: string;
    selection?: AbstractSelection;
}) => {
    const isBlockSelection = selection?.isBlock();
    const blockSelection = selection?.getNodeSelection(nodeId);
    return {
        insideSelection: !isBlockSelection ? blockSelection : undefined,
        blockSelection: Boolean(isBlockSelection && blockSelection),
    };
};

export const Child = React.memo(
    ({ parentId, nodeId }: { parentId: string; nodeId: string }) => {
        const editor = useContext(EditorContext);
        const view = useContext(ViewContext);
        const node = editor.state.nodes[nodeId];
        const selectionTypes = getSelection({
            nodeId,
            selection: editor.state.selection,
        });

        const [nodeState, setNodeState] = useState({
            node,
            nodeSelection: selectionTypes.insideSelection,
            blockSelected: selectionTypes.blockSelection,
        });

        const onChange = useCallback(() => {
            const selectionTypes = getSelection({
                nodeId,
                selection: editor.state.selection,
            });

            if (
                nodeState.node !== editor.state.nodes[nodeId] ||
                nodeState.nodeSelection !== selectionTypes.insideSelection ||
                nodeState.blockSelected !== selectionTypes.blockSelection
            ) {
                setNodeState({
                    node: editor.state.nodes[nodeId],
                    nodeSelection: selectionTypes.insideSelection,
                    blockSelected: selectionTypes.blockSelection,
                });
            }
        }, [nodeState, editor]);

        useEffect(() => {
            editor.on('tr', onChange);
            return () => editor.off('tr', onChange);
        }, [onChange]);
        if (!node) return <></>;

        const Compo = view.blocks[node.type];
        const nodeSchema = editor.schema[node.type];
        if (!Compo) throw `no component matching type ${node.type}`;
        if (!nodeSchema) throw `no schema matching type ${node.type}`;

        return (
            <Compo
                parentId={parentId}
                node={nodeState.node}
                selection={nodeState.nodeSelection}
                blockSelected={nodeState.blockSelected}
            />
        );
    }
);
