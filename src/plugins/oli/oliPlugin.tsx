import { PluginFactory } from '../../editor/view/plugin/types';
import { Oli } from './Oli';

export const OliPlugin: PluginFactory = () => () => {
    return {
        key: 'oli',
        addBlocks() {
            return { oli: Oli };
        },
    };
};
