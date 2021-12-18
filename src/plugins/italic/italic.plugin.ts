import { PluginFactory } from '../../editor/view/plugin/types';
import { Italic } from './Italic';

export const ItalicPlugin: PluginFactory = () => () => {
    return {
        key: 'italic',
        addMarks: () => ({
            i: Italic,
        }),
    };
};
