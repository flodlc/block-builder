import React, { useMemo } from 'react';
import { NodeComponentAttrs } from '../../editor/view/types';
import { MentionValue } from './mention.types';

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

export const Mention = ({ node }: NodeComponentAttrs<MentionValue>) => {
    const displayed = useMemo(
        () => getValue(node.attrs as MentionValue),
        [node.attrs]
    );
    return (
        <span style={{ color: '#ffffff99' }}>
            <span style={{ opacity: 0.6 }}>
                {getPrefix(node.attrs as MentionValue)}
            </span>
            {displayed}
        </span>
    );
};
