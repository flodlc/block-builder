import { PluginFactory } from '../../indexed';
import { Card } from './Card';

export const CardPlugin: PluginFactory = () => () => {
    return {
        key: 'card',
        addBlocks: () => ({
            card: Card,
        }),
    };
};
