import { Node } from '../editor/model/types';
import { Children } from '../editor/view/Children';
import React from 'react';

export const Callout = ({ node }: { node: Node; parentId: string }) => {
    return (
        <div
            style={{
                background: 'rgb(69, 58, 91)',
                padding: '20px',
                margin: '20px 0',
                display: 'flex',
            }}
            data-uid={node.id}
            className="callout"
        >
            <div style={{ marginRight: '15px' }}>👌</div>
            <div style={{ flex: 1 }}>
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
        </div>
    );
};
