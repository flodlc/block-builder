import React from 'react';
import { TextSelection } from '../../editor/model/Selection';
import { PluginFactory } from '../../editor/view/plugin/types';
import { View } from '../../editor/view/View';
import { BallonMenuComponentWrapper } from './BallonMenu';
import { BALLON_MENU_EVENTS } from './ballonMenu.const';
import { MenuBallonProps } from './ballonMenu.type';

export const MenuBallonPlugin: PluginFactory =
    ({ BallonContent }: { BallonContent: React.ReactElement }) =>
    ({ editor, dom }) => {
        const close = () => {
            editor.trigger<MenuBallonProps>(BALLON_MENU_EVENTS.show, undefined);
        };

        const selectionHandler = () => {
            const selection = editor.state.selection as TextSelection;
            if (!selection?.range) return;
            const isHighlighted = selection.range[1] - selection.range[0] > 0;
            if (!isHighlighted) {
                close();
                return;
            }

            editor.trigger<MenuBallonProps>(BALLON_MENU_EVENTS.show, {
                startBoundingRect: View.getDomRectAtPos(
                    selection.nodeId,
                    selection.range[0]
                ),
            });
        };
        const selectionKeyDownHandler = (e: KeyboardEvent) => {
            if (!e.shiftKey) {
                close();
                return;
            }
            setTimeout(() => {
                selectionHandler();
            }, 500); // Add a time for the selection to be propagate after keydown
        };

        dom.addEventListener('mouseup', selectionHandler);
        dom.addEventListener('keydown', selectionKeyDownHandler);

        return {
            key: 'menuBallon',
            destroy: () => {
                dom.removeEventListener('mouseup', selectionHandler);
                dom.removeEventListener('keydown', selectionKeyDownHandler);
            },
            Component: () => (
                <BallonMenuComponentWrapper editor={editor}>
                    {BallonContent}
                </BallonMenuComponentWrapper>
            ),
        };
    };
