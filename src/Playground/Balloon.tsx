import React, { useState } from 'react';
import { useEffect } from 'react';
import { Editor } from '../editor/model/Editor';
import { BALLOON_EVENTS } from '../plugins/balloon/balloon.const';
import { BalloonPluginState } from '../plugins/balloon/balloon.types';
import { EditorApi } from './editorApi';
import styled from '@emotion/styled';

const Button = styled.div`
    color: white;
    height: 34px;
    width: 34px;
    font-weight: bold;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 80ms;
    cursor: pointer;
    border-right: 1px solid rgb(28, 28, 28);

    &:last-child {
        border-right: none;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(4px);
    }
`;

export const Balloon = ({
    editor,
    editorApi,
}: {
    editor: Editor;
    editorApi: EditorApi;
}) => {
    const [state, setState] = useState<BalloonPluginState>();
    useEffect(() => {
        const handler = (newState: BalloonPluginState) => {
            setState(newState);
        };
        editor.on(BALLOON_EVENTS.changed, handler);
        return () => {
            editor.off(BALLOON_EVENTS.changed, handler);
        };
    }, []);

    const startRect = state?.startBoundingRect;
    if (!state?.visible || !startRect) return <></>;
    return (
        state?.visible && (
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    padding: '2px 6px',
                    borderRadius: '5px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    position: 'absolute',
                    bottom: `calc(100% - ${startRect.top}px + 10px)`,
                    left: `${startRect.left}px`,
                }}
            >
                <Button
                    style={{ color: editorApi.isBold() ? '#4747d3' : '' }}
                    onClick={() => editorApi.toggleBold()}
                >
                    B
                </Button>
                <Button
                    style={{ color: editorApi.isItalic() ? '#4747d3' : '' }}
                    onClick={() => editorApi.toggleItalic()}
                >
                    I
                </Button>
                <Button
                    style={{ color: editorApi.isUnderline() ? '#4747d3' : '' }}
                    onClick={() => editorApi.toggleUnderline()}
                >
                    U
                </Button>
            </div>
        )
    );
};
