import { PluginFactory } from '../../indexed';
import { Callout } from './Callout';

export const CalloutPlugin: PluginFactory = () => () => {
    return {
        key: 'callout',
        addBlocks: () => ({
            callout: Callout,
        }),
    };
};
