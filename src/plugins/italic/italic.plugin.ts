import { PluginFactory } from '../../indexed';
import { Italic } from './Italic';

export const ItalicPlugin: PluginFactory = () => () => {
    return {
        key: 'italic',
        addMarks: () => ({
            i: Italic,
        }),
    };
};
