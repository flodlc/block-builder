import { PluginFactory } from '../../editor/view/plugin/types';
import { Underline } from './Underline';

export const UnderlinePlugin: PluginFactory = () => () => {
    return {
        key: 'underline',
        addMarks: () => ({
            u: Underline,
        }),
    };
};
