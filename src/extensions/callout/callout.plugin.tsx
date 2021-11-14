import { PluginFactory } from '../../editor/view/plugin/types';
import { Callout } from './Callout';

export const CalloutPlugin: PluginFactory = () => () => {
    return {
        key: 'mention',
        addBlocks: () => ({
            callout: Callout,
        }),
    };
};
