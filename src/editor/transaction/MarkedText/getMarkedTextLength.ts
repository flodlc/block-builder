import { MarkedText } from '../../model/types';
import { splitMarkedText } from './splitMarkedText';

export const getMarkedTextLength = (text: MarkedText) => {
    return splitMarkedText(text).length;
};
