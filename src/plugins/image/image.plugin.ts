import { PluginFactory } from '../../indexed';
import { Image } from './Image';

export const ImagePlugin: PluginFactory = () => () => {
    return {
        key: 'image',
        addBlocks() {
            return { image: Image };
        },
    };
};
