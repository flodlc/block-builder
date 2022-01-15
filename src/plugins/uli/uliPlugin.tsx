import { PluginFactory } from '../../indexed';
import { Uli } from './Uli';
export const UliPlugin: PluginFactory = () => () => {
    return {
        key: 'uli',
        addBlocks() {
            return { uli: Uli };
        },
    };
};
