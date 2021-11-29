import React from 'react';

const DefaultPlaceholderContent = () => (
    <>
        Jot something down or{' '}
        <span
            style={{
                padding: '3px 6px',
                background: 'grey',
                borderRadius: '4px',
            }}
        >
            /
        </span>{' '}
        for more options
    </>
);

export const PlaceholderWrapper = ({ children }: { children?: any }) => {
    return (
        <div className="placeholder">
            {children ?? <DefaultPlaceholderContent />}
        </div>
    );
};
