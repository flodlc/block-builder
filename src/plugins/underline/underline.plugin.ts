import { PluginFactory } from '../../indexed';
import { Underline } from './Underline';

export const UnderlinePlugin: PluginFactory = () => () => {
    return {
        key: 'underline',
        addMarks: () => ({
            u: Underline,
        }),
    };
};
