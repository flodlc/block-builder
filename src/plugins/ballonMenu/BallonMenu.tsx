import { Editor } from '../../editor/model/Editor';
import React, { ReactChild, useEffect, useState } from 'react';
import { BALLON_MENU_EVENTS } from './ballonMenu.const';
import { MenuBallonProps } from './ballonMenu.type';

export const BallonMenuComponentWrapper = ({
    editor,
    children,
}: {
    editor: Editor;
    children: ReactChild;
}) => {
    const [state, setState] = useState<MenuBallonProps | undefined>();
    useEffect(() => {
        const onChange = setState;
        editor.on(BALLON_MENU_EVENTS.show, onChange);
        return () => editor.off(BALLON_MENU_EVENTS.show, onChange);
    }, []);

    return <BallonMenuComponent {...state}>{children}</BallonMenuComponent>;
};

export const BallonMenuComponent = ({
    startBoundingRect,
    children,
}: Partial<MenuBallonProps> & { children: ReactChild }) => {
    if (!startBoundingRect) return null;
    return (
        <div
            style={{
                overflow: 'auto',
                background: 'white',
                display: 'flex',
                backgroundColor: '#3f4447',
                color: 'white',
                boxShadow:
                    'rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px',
                borderRadius: '3px',
                top: `${
                    startBoundingRect.top - startBoundingRect.height - 5
                }px`,
                left: `${startBoundingRect.left}px`,
                position: 'absolute',
            }}
        >
            {children}
        </div>
    );
};
