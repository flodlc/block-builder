import { PluginFactory } from '../../editor/view/plugin/types';
import { Bold } from './Bold';

export const BoldPlugin: PluginFactory = () => () => {
    return {
        key: 'bold',
        addMarks: () => ({
            b: Bold,
        }),
    };
};
