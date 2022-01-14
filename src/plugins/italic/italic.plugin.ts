import { PluginFactory } from '../..';
import { Italic } from './Italic';

export const ItalicPlugin: PluginFactory = () => () => {
    return {
        key: 'italic',
        addMarks: () => ({
            i: Italic,
        }),
    };
};
