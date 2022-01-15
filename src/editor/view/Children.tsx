import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { useView } from './contexts/ViewContext';
import { AbstractSelection, TextSelection } from '../model';
import { useEditor } from './contexts/EditorContext';

export const Children = ({
    childrenIds,
    parentId,
}: {
    childrenIds?: string[];
    parentId: string;
}) => {
    const scrollRef = useRef(0);
    scrollRef.current = document.scrollingElement?.scrollTop ?? 0;
    useLayoutEffect(() => {
        if (!document.scrollingElement) return;
        if (document.scrollingElement.scrollTop === scrollRef.current) return;
        document.scrollingElement.scrollTop = scrollRef.current;
    });

    return (
        <>
            <div data-children-uid={parentId} />
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
    const textSelection = selection?.getNodeSelection(nodeId) as TextSelection;
    return {
        insideSelection: !isBlockSelection ? textSelection : undefined,
        blockSelection: Boolean(isBlockSelection && textSelection),
    };
};

export const Child = React.memo(
    ({ parentId, nodeId }: { parentId: string; nodeId: string }) => {
        const editor = useEditor();
        const view = useView();
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
        if (!Compo) throw `no component matching type ${node.type}`;

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
