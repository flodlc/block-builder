import React from 'react';

const DefaultPlaceholderContent = () => (
    <>
        Type{' '}
        <span
            style={{
                padding: '3px 6px',
                background: 'grey',
                borderRadius: '4px',
            }}
        >
            /
        </span>{' '}
        for more commands
    </>
);

export const PlaceholderWrapper = ({
    children,
    style,
}: {
    children?: any;
    style: any;
}) => {
    return (
        <div style={style} className="placeholder">
            {children ?? <DefaultPlaceholderContent />}
        </div>
    );
};
