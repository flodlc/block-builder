import { PluginFactory } from '../../editor/view/plugin/types';
import { onBackspace } from './onBackspace';
import { onEscape } from './onEscape';

export const BlockSelectionShortcutsPlugin: PluginFactory =
    () =>
    ({ editor }) => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!editor.state.selection?.isBlock()) return;
            if (e.key === 'r' && e.metaKey) return;

            e.preventDefault();
            e.stopPropagation();

            const handler = {
                Backspace: () => onBackspace({ editor }),
                Escape: () => onEscape({ editor }),
            }[e.key];

            handler?.();
        };

        document.addEventListener('keydown', onKeyDown);
        return {
            key: 'Backspace',
            destroy() {
                document.removeEventListener('keydown', onKeyDown);
            },
        };
    };
