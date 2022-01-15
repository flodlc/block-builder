import { PluginFactory } from '../../indexed';
import { Text } from './Text';

export const TextPlugin: PluginFactory = () => () => {
    return {
        key: 'text',
        addBlocks: () => ({
            text: Text,
        }),
    };
};
