import { PluginFactory } from '../../editor/view/plugin/types';
import { Uli } from './Uli';
export const UliPlugin: PluginFactory = () => () => {
    return {
        key: 'uli',
        addBlocks() {
            return { uli: Uli };
        },
    };
};
