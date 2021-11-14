import React, { useContext, useEffect, useState } from 'react';
import { Node } from '../model/types';
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
        const [node, setNode] = useState<Node>(editor.state.nodes[nodeId]);

        const selectionTypes = getSelection({
            nodeId,
            selection: editor.state.selection,
        });

        const [nodeSelection, setNodeSelection] = useState(
            selectionTypes.insideSelection
        );

        const [blockSelected, setBlockSelected] = useState(
            selectionTypes.blockSelection
        );

        useEffect(() => {
            const isBlockSelection = editor.state.selection?.isBlock();
            const blockSelection =
                editor.state.selection?.getNodeSelection(nodeId);
            setNodeSelection(!isBlockSelection ? blockSelection : undefined);
            setBlockSelected(Boolean(isBlockSelection && blockSelection));
            const onChange = () => {
                setNode(editor.state.nodes[nodeId]);
                const selectionTypes = getSelection({
                    nodeId,
                    selection: editor.state.selection,
                });
                setNodeSelection(selectionTypes.insideSelection);
                setBlockSelected(selectionTypes.blockSelection);
            };
            editor.on('tr', onChange);
            return () => editor.off('tr', onChange);
        }, []);
        if (!node) return <></>;

        const Compo = view.blocks[node.type] ?? Def;
        return (
            <div
                style={{
                    position: 'relative',
                }}
            >
                <Compo
                    parentId={parentId}
                    node={node}
                    selection={nodeSelection}
                />
                <div
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        top: '0',
                        transition: 'background 300ms',
                        pointerEvents: 'none',
                        background: blockSelected
                            ? 'rgba(46, 170, 220, 0.2)'
                            : '',
                    }}
                />
            </div>
        );
    }
);

const Def = () => <></>;
