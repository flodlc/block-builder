import { PluginFactory } from '../../indexed';
import { ToggleList } from './ToggleList';

export const ToggleListPlugin: PluginFactory = () => () => {
    return {
        key: 'toggleList',
        addBlocks() {
            return { toggleList: ToggleList };
        },
    };
};
