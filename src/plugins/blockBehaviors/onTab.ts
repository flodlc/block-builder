import { Editor } from '../../indexed';
import { TextSelection } from '../../indexed';
import { unwrap } from './unwrap';
import { wrapInPrevious } from './actions/wrapInPrevious';

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
