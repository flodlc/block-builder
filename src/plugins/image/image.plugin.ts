import { PluginFactory } from '../../editor/view/plugin/types';
import { Image } from './Image';

export const ImagePlugin: PluginFactory = () => () => {
    return {
        key: 'image',
        addBlocks() {
            return { image: Image };
        },
    };
};
