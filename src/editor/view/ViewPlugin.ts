import { Editor } from '../model/Editor';

export interface ViewPlugin {
    addInputRules?: () => {
        rule: RegExp;
        handler: (editor: Editor) => boolean;
    }[];
    addKeyboardShortcuts?: () => Record<string, (editor: Editor) => boolean>;
}
