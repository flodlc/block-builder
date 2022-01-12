import { PluginFactory } from '../../editor/view/plugin/types';
import { ToggleList } from './ToggleList';

export const ToggleListPlugin: PluginFactory = () => () => {
    return {
        key: 'toggleList',
        addBlocks() {
            return { toggleList: ToggleList };
        },
    };
};
