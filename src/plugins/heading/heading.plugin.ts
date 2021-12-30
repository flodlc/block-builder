import { PluginFactory } from '../../editor/view/plugin/types';
import { Heading } from './Heading';

export const HeadingPlugin: PluginFactory = () => () => {
    return {
        key: 'heading',
        addBlocks: () => ({
            heading: Heading,
        }),
    };
};
