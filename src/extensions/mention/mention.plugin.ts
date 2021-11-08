import { mentionInputRules } from './mention.inputRules';
import { Mention } from './Mention';
import { ViewPlugin } from '../../editor/view/types';

export const mentionPlugin: ViewPlugin = {
    addInputRules: () => mentionInputRules,
    addMarks: () => ({
        mention: Mention,
    }),
};
