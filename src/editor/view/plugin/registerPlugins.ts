import { Plugin } from './types';
import { ViewConfig } from '../types';
import { Editor } from '../../model/Editor';

export const registerPlugins = ({
    editor,
    plugins,
    viewConfig,
    dom,
}: {
    editor: Editor;
    plugins: Plugin[];
    viewConfig: ViewConfig;
    dom: HTMLElement;
}) => {
    return plugins.map((Plugin) => {
        const registeredPlugin = Plugin({ editor, dom });
        viewConfig.blocks = {
            ...viewConfig.blocks,
            ...registeredPlugin.addBlocks?.(),
        };
        viewConfig.marks = {
            ...viewConfig.marks,
            ...registeredPlugin.addMarks?.(),
        };
        return registeredPlugin;
    });
};
