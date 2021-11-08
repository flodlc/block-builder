import { MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';

export const getMarkedTextLength = (text?: MarkedText) => {
    return text !== undefined ? splitMarkedText(text).length : undefined;
};
