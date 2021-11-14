import { Editor } from '../../editor/model/Editor';

export const onEscape = ({ editor }: { editor: Editor }) => {
    editor.createTransaction().focus().dispatch();
};
