import { Editor } from '../../indexed';

export const onEscape = ({ editor }: { editor: Editor }) => {
    editor.createTransaction().focus().dispatch();
};
