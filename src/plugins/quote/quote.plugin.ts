import { PluginFactory } from '../../editor/view/plugin/types';
import { Quote } from './Quote';

export const QuotePlugin: PluginFactory = () => () => {
    return {
        key: 'quote',
        addBlocks: () => ({
            quote: Quote,
        }),
        addSchema: () => ({
            quote: {
                attrs: {},
                allowText: false,
                allowChildren: true,
            },
        }),
    };
};
