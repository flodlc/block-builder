import { PluginFactory } from '../../plugin/types';
import { onArrowUp } from './onArrowUp';
import { onArrowDown } from './onArrowDown';
import { onArrowLeft } from './onArrowLeft';
import { onArrowRight } from './onArrowRight';
import { GLOBAL_EDITABLE } from '../../ReactView';

export const ArrowNavigationPlugin: PluginFactory =
    () =>
    ({ dom, editor, view }) => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!editor.state.selection?.isText()) return;
            if (e.key === 'ArrowUp') {
                if (GLOBAL_EDITABLE) return;
                onArrowUp(e, editor, view);
            }
            if (e.key === 'ArrowDown') {
                if (GLOBAL_EDITABLE) return;
                onArrowDown(e, editor, view);
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
