import { Plugin } from './types';
import { Editor } from '../../model/Editor';
import { View } from '../View';
import { compileSchema } from '../../model/schema';

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
        view.editor.schema = compileSchema({
            schema: {
                ...view.editor.schema,
                ...registeredPlugin.addSchema?.(),
            },
        });
        return registeredPlugin;
    });
};
