import { Editor } from '../..';

export const onEscape = ({ editor }: { editor: Editor }) => {
    editor.createTransaction().focus().dispatch();
};
