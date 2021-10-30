import React, { useContext } from 'react';
import { CustomSelection, Node } from '../editor/model/types';
import { EditorContext } from '../editor/view/EditorContext';

export const Button = ({
    node,
    selection,
}: {
    node: Node;
    parentId: string;
    selection?: CustomSelection;
}) => {
    const editor = useContext(EditorContext);
    const onClick = () => {
        editor
            .createTransaction()
            .focus({ [node.id]: {} })
            .dispatch(true);
    };

    return (
        <button
            onClick={onClick}
            style={{
                padding: '8px 16px',
                margin: '10px 0',
                width: '100%',
                display: 'block',
                border: selection ? '2px blue solid' : '',
            }}
            data-uid={node.id}
        >
            {selection
                ? 'Je suis un block selectionné'
                : 'clique mois pour me select'}
        </button>
    );
};
