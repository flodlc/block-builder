import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '../../editor/model/Editor';
import { BLOCK_SELECTION_EVENTS, DraggingState } from './blockSelection.plugin';

export const BlockSelectionWrapper = ({ editor }: { editor: Editor }) => {
    const [draggingState, setDraggingState] = useState<DraggingState | void>();
    useEffect(() => {
        const handler = (draggingState: DraggingState) => {
            setDraggingState({ ...draggingState });
        };
        editor.on(BLOCK_SELECTION_EVENTS.changed, handler);
        return () => editor.off(BLOCK_SELECTION_EVENTS.changed, handler);
    }, []);
    return (
        <BlockSelection
            start={draggingState?.start}
            current={draggingState?.current}
        />
    );
};

export const BlockSelection = ({
    start,
    current,
}: {
    start?: { x: number; y: number };
    current?: { x: number; y: number };
}) => {
    if (!start || !current) return <></>;
    const ref = useRef(null);
    return (
        <div
            ref={ref}
            style={{
                pointerEvents: 'none',
                background: 'rgba(46, 170, 220, 0.2)',
                position: 'absolute',
                top: `${Math.min(start.y, current.y)}px`,
                left: `${Math.min(start.x, current.x)}px`,
                height: `${Math.abs(current.y - start.y)}px`,
                width: `${Math.abs(current.x - start.x)}px`,
            }}
        />
    );
};
