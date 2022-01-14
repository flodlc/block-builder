import { PluginFactory } from '../..';
import { Divider } from './Divider';

export const DividerPlugin: PluginFactory = () => () => {
    return {
        key: 'divider',
        addBlocks: () => ({
            divider: Divider,
        }),
    };
};
