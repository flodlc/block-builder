import { PluginFactory } from '../..';
import { Bold } from './Bold';

export const BoldPlugin: PluginFactory = () => () => {
    return {
        key: 'bold',
        addMarks: () => ({
            b: Bold,
        }),
    };
};
