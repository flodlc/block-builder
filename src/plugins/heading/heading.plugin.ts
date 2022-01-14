import { PluginFactory } from '../..';
import { Heading } from './Heading';

export const HeadingPlugin: PluginFactory = () => () => {
    return {
        key: 'heading',
        addBlocks: () => ({
            heading: Heading,
        }),
    };
};
