import { PluginFactory } from '../..';
import { Underline } from './Underline';

export const UnderlinePlugin: PluginFactory = () => () => {
    return {
        key: 'underline',
        addMarks: () => ({
            u: Underline,
        }),
        addSchema: () => ({
            u: { attrs: {}, allowText: true, allowChildren: true },
        }),
    };
};
