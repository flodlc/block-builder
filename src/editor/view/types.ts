import { Editor } from '../model/Editor';

export type TextSelection = {
    from: number;
    to: number;
};

export type ViewConfig = {
    inputRules: InputRule[];
    marks: Record<string, any>;
    blocks: Record<string, any>;
};

export type InputRule = {
    regex: RegExp[];
    callback: (editor: Editor, result: RegExpExecArray) => void;
};

export interface ViewPlugin {
    addInputRules?: () => InputRule[];
    addMarks?: () => Record<string, any>;
    addBlocks?: () => Record<string, any>;
}
