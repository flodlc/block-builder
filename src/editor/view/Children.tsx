import React, { useContext } from 'react';
import { StateContext } from './StateContext';
import { componentMap } from '../../components/component.map';
import { State } from '../model/types';

export const Children = ({
    childrenIds,
    parentId,
}: {
    childrenIds?: string[];
    parentId: string;
}) => {
    const state = useContext(StateContext);
    return (
        <>
            {childrenIds &&
                childrenIds.map((childId) => (
                    <Child
                        state={state}
                        key={childId}
                        parentId={parentId}
                        nodeId={childId}
                    />
                ))}
        </>
    );
};

const Child = ({
    nodeId,
    parentId,
    state,
}: {
    nodeId: string;
    parentId: string;
    state: State;
}) => {
    const node = state.nodes[nodeId];
    const Compo = componentMap[node.type];

    return (
        <Compo
            parentId={parentId}
            node={node}
            selection={state.selection?.blockIds?.[nodeId]}
        />
    );
};
