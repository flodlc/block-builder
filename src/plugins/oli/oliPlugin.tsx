import { PluginFactory } from '../..';
import { Oli } from './Oli';

export const OliPlugin: PluginFactory = () => () => {
    return {
        key: 'oli',
        addBlocks() {
            return { oli: Oli };
        },
    };
};
