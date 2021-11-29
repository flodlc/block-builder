import { Plugin } from './types';
import { Editor } from '../../model/Editor';
import { View } from '../View';

export const registerPlugins = ({
    editor,
    plugins,
    view,
    dom,
}: {
    editor: Editor;
    plugins: Plugin[];
    view: View;
    dom: HTMLElement;
}) => {
    return plugins.map((Plugin) => {
        const registeredPlugin = Plugin({ editor, dom, view: view });
        view.blocks = {
            ...view.blocks,
            ...registeredPlugin.addBlocks?.(),
        };
        view.marks = {
            ...view.marks,
            ...registeredPlugin.addMarks?.(),
        };
        return registeredPlugin;
    });
};
