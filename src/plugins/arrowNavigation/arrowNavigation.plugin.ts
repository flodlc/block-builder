import { PluginFactory } from '../../editor/view/plugin/types';
import { onArrowUp } from './onArrowUp';
import { onArrowDown } from './onArrowDown';
import { onArrowLeft } from './onArrowLeft';
import { onArrowRight } from './onArrowRight';

export const ArrowNavigationPlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!editor.state.selection?.isText()) return;
            if (e.key === 'ArrowUp') {
                onArrowUp(e, editor);
            }
            if (e.key === 'ArrowDown') {
                onArrowDown(e, editor);
            }
            if (e.key === 'ArrowLeft') {
                onArrowLeft(e, editor);
            }
            if (e.key === 'ArrowRight') {
                onArrowRight(e, editor);
            }
        };

        dom.addEventListener('keydown', onKeyDown);
        return {
            key: 'arrowPlugin',
            destroy: () => {
                dom.removeEventListener('keydown', onKeyDown);
            },
        };
    };
