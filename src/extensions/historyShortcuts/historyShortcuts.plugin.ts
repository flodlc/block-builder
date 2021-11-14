import { PluginFactory } from '../../editor/view/plugin/types';

export const HistoryShortcutsPlugin: PluginFactory =
    () =>
    ({ editor }) => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'z' && e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                editor.back();
            }
        };

        document.addEventListener('keydown', onKeyDown, { capture: false });
        return {
            key: 'historyShortcutsPlugin',
            destroy: () => {
                document.addEventListener('keydown', onKeyDown, {
                    capture: false,
                });
            },
        };
    };
