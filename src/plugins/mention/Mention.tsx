import React from 'react';
import { Mark } from '../../editor/model/types';

export const Mention = ({ mark }: { mark: Mark }) => {
    return (
        <span
            data-attrs={JSON.stringify(mark.d)}
            style={{ color: '#ffffff99' }}
            contentEditable={false}
        >
            <span>
                <span style={{ opacity: 0.6 }}>@</span>
                {mark.d?.name ?? 'Select someone'}
            </span>
        </span>
    );
};
