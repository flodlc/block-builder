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

            switch (e.key) {
                case 'Backspace':
                    onBackspace({ e, editor });
                    break;
                case 'Tab':
                    onTab({ e, editor });
                    break;
                case 'Delete':
                    onDelete({ e, editor });
                    break;
                case 'Enter':
                    if (!e.shiftKey) {
                        onEnter({ e, editor });
                    }
                    break;
            }
        };
        dom.addEventListener('keydown', keydownHandler);
        return {
            key: 'jumps',
            destroy: () => {
                dom.removeEventListener('keydown', keydownHandler);
            },
        };
    };
