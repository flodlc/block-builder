import { Mention } from './Mention';
import { PluginFactory } from '../../editor/view/plugin/types';
import { onChange } from './onChange';

export const MentionPlugin: PluginFactory =
    () =>
    ({ editor }) => {
        const handler = onChange({ editor });
        editor.on('change', handler);
        return {
            key: 'mention',
            addMarks: () => ({
                mention: Mention,
            }),
            destroy: () => {
                editor.off('change', handler);
            },
        };
    };
