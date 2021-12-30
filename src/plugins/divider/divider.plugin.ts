import { PluginFactory } from '../../editor/view/plugin/types';
import { Divider } from './Divider';

export const DividerPlugin: PluginFactory = () => () => {
    return {
        key: 'divider',
        addBlocks: () => ({
            divider: Divider,
        }),
    };
};
