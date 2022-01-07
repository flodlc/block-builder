import React from 'react';

export const SelectionHalo = ({
    blockSelected,
}: {
    blockSelected: boolean;
}) => (
    <div
        contentEditable={false}
        style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: '0',
            left: '0',
            transition: 'background 300ms',
            pointerEvents: 'none',
            background: blockSelected ? 'rgba(46, 170, 220, 0.2)' : '',
        }}
    />
);
