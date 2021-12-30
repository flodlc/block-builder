import { PluginFactory } from '../../editor/view/plugin/types';
import { Heading } from './Heading';

export const HeadingPlugin: PluginFactory = () => () => {
    return {
        key: 'heading',
        addBlocks: () => ({
            heading: Heading,
        }),
        addSchema: () => ({
            heading: {
                attrs: {
                    level: {
                        default: 1,
                        required: true,
                    },
                },
                allowText: true,
                allowChildren: false,
            },
        }),
    };
};
