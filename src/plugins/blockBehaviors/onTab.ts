import { wrapInPrevious } from './wrapIn';
import { Editor } from '../..';
import { TextSelection } from '../..';
import { unwrap } from './unwrap';

export const onTab = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    editor.runCommand(wrapInPrevious({ nodeId: selection.nodeId }));
    return true;
};

export const onBackTab = ({ editor }: { editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    editor.runCommand(unwrap({ nodeId: selection.nodeId }));
    return true;
};
