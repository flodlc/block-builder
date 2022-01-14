import { PluginFactory } from '../..';
import { Card } from './Card';

export const CardPlugin: PluginFactory = () => () => {
    return {
        key: 'card',
        addBlocks: () => ({
            card: Card,
        }),
    };
};
