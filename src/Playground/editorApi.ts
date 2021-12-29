import { boldApi } from '../plugins/bold/bold.api';
import { italicApi } from '../plugins/italic/italic.api';
import { Editor } from '../editor/model/Editor';
import { underlineApi } from '../plugins/underline/underline.api';

export const createEditorApi = (editor: Editor) => ({
    ...boldApi(editor),
    ...italicApi(editor),
    ...underlineApi(editor),
});

export type EditorApi = ReturnType<typeof createEditorApi>;
