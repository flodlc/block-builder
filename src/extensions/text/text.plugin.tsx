import { PluginFactory } from '../../editor/view/plugin/types';
import { Text } from './Text';

export const TextPlugin: PluginFactory = () => () => {
    return {
        key: 'mention',
        addBlocks: () => ({
            text: Text,
        }),
    };
};
