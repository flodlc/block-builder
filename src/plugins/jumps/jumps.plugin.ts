import { PluginFactory } from '../../editor/view/plugin/types';
import { onBackspace } from './onBackspace';
import { onTab } from './onTab';
import { onEnter } from './onEnter';
import { onDelete } from './onDelete';

export const JumpsPlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const keydownHandler = (e: KeyboardEvent) => {
            if (!editor.state.selection?.isText()) return;

            const handler = {
                Backspace: () => onBackspace({ e, editor }),
                Tab: () => onTab({ e, editor }),
                Enter: () => onEnter({ e, editor }),
                Delete: () => onDelete({ e, editor }),
            }[e.key];

            handler?.();
        };
        dom.addEventListener('keydown', keydownHandler);
        return {
            key: 'jumps',
            destroy: () => {
                dom.removeEventListener('keydown', keydownHandler);
            },
        };
    };
