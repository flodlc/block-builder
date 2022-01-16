import { MarkedText } from '../types';

export const getStringText = (markedText: MarkedText) => {
    return markedText.reduce((acc, item) => acc + item.text, '');
};
