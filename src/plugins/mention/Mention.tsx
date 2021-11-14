import React, { useEffect, useState } from 'react';
import { Mark } from '../../editor/model/types';
import Tippy from '@tippyjs/react';

export const Mention = ({
    mark,
    updateMark,
}: {
    mark: Mark;
    updateMark: (mark: Mark) => void;
}) => {
    const [select, setSelect] = useState(false);

    const onSelect = (name: string) => {
        updateMark({ ...mark, d: { ...mark.d, name } });
        setSelect(false);
    };

    return (
        <span
            data-attrs={JSON.stringify(mark.d)}
            data-type="mention"
            style={{
                fontWeight: 800,
                cursor: 'pointer',
                color: 'lightblue',
            }}
            onMouseDown={() => setSelect(true)}
            contentEditable={false}
        >
            <Tippy
                visible={select}
                content={
                    select ? (
                        <MentionSelect
                            onBlur={() => setSelect(false)}
                            onSelect={onSelect}
                        />
                    ) : (
                        <></>
                    )
                }
            >
                <span>@{mark.d?.name ?? 'Select someone'}</span>
            </Tippy>
        </span>
    );
};

const MentionSelect = ({
    onSelect,
    onBlur,
}: {
    onSelect: (name: string) => void;
    onBlur: () => void;
}) => {
    const choices = ['Florian', 'Clara', 'Jean'];
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.dropdown')) {
                onBlur();
            }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);
    return (
        <div
            className="dropdown"
            style={{
                pointerEvents: 'all',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 0 12px 1px #0000002b',
            }}
        >
            {choices.map((choice, i) => (
                <div
                    onClick={() => onSelect(choice)}
                    style={{ padding: '16px', cursor: 'pointer' }}
                    key={i}
                >
                    {choice}
                </div>
            ))}
        </div>
    );
};
