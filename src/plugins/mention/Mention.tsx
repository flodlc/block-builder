import React, { useMemo } from 'react';
import { Mark } from '../../editor/model/types';

function getValue(value: { type: string; date?: string; name?: string }) {
    if (!value) return undefined;
    if (value.type === 'date') {
        return value.date
            ? new Date(value.date).toLocaleDateString('FR-fr', {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric',
              })
            : undefined;
    } else if (value.type === 'person') {
        return value.name;
    }
}

function getPrefix(value: { type: string }) {
    if (!value) return;
    if (value.type === 'date') return '🗓';
    if (value.type === 'person') return '@';
}

export const Mention = ({ mark }: { mark: Mark }) => {
    const displayed = useMemo(() => getValue(mark.d?.value), [mark.d?.value]);
    return (
        <span
            data-attrs={JSON.stringify(mark.d)}
            data-type="mention"
            style={{
                color: '#ffffff99',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
            contentEditable={false}
        >
            <span></span>
            <span style={{}}>
                <span style={{ opacity: 0.6 }}>{getPrefix(mark.d?.value)}</span>
                {mark.d?.name}
                {displayed}
            </span>
            <span></span>
        </span>
    );
};
