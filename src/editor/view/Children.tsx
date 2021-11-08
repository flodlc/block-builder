import React, { useContext, useEffect, useState } from 'react';
import { Node } from '../model/types';
import { EditorContext } from './contexts/EditorContext';
import { ViewContext } from './contexts/ViewContext';

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
                    <Child
                        key={childId}
                        parentId={parentId}
                        // node={nodes[childId]}
                        nodeId={childId}
                        // nodeSelection={blockIds?.[childId]}
                    />
                ))}
        </>
    );
};

export const Child = React.memo(
    ({ parentId, nodeId }: { parentId: string; nodeId: string }) => {
        const editor = useContext(EditorContext);
        const view = useContext(ViewContext);
        const [node, setNode] = useState<Node>(editor.state.nodes[nodeId]);
        const [nodeSelection, setNodeSelection] = useState<Node>(
            editor.state.selection?.blockIds?.[nodeId]
        );
        useEffect(() => {
            const onChange = () => {
                setNode(editor.state.nodes[nodeId]);
                setNodeSelection(editor.state.selection?.blockIds?.[nodeId]);
            };
            editor.on('change', onChange);
            return () => editor.off('change', onChange);
        }, []);
        if (!node) return <></>;
        const Compo = view.blocks[node.type] ?? <></>;
        return (
            <Compo parentId={parentId} node={node} selection={nodeSelection} />
        );
    }
);
