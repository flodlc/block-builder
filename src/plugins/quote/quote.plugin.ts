import { PluginFactory } from '../..';
import { Quote } from './Quote';

export const QuotePlugin: PluginFactory = () => () => {
    return {
        key: 'quote',
        addBlocks: () => ({
            quote: Quote,
        }),
    };
};
