import { PluginFactory } from '../../editor/view/plugin/types';
import { Card } from './Card';

export const CardPlugin: PluginFactory = () => () => {
    return {
        key: 'card',
        addBlocks: () => ({
            card: Card,
        }),
    };
};
