import { unwrap } from '../commands/unwrap';
import { wrapInPrevious } from '../commands/wrapIn';
import { Editor } from '../../editor/model/Editor';
import { TextSelection } from '../../editor/model/Selection';

export const onTab = ({ e, editor }: { e: KeyboardEvent; editor: Editor }) => {
    const selection = editor.state.selection as TextSelection;
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
        editor.runCommand(unwrap({ nodeId: selection.nodeId }));
    } else {
        editor.runCommand(wrapInPrevious({ nodeId: selection.nodeId }));
    }
};
