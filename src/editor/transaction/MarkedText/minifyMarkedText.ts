import { Mark, MarkedText } from '../../model/types';

export const minifyMarkedText = (text: MarkedText): MarkedText => {
    let minified: MarkedText = [];
    let tempMarks: Mark[] = [];
    let tempString = '' as string;
    text.forEach((markedNode) => {
        const character = markedNode.s as string;
        const charMarks = markedNode.m ?? [];

        const hasSameMarkup =
            JSON.stringify(charMarks) === JSON.stringify(tempMarks);
        const canMerge = hasSameMarkup && character !== '•';

        if (!tempString.length) {
            tempString += character;
            tempMarks = [...charMarks];
        } else if (!canMerge) {
            minified = [...minified, { s: tempString, m: tempMarks }];
            tempString = character;
            tempMarks = [...charMarks];
        } else {
            tempString += character;
        }
    });

    return !tempString
        ? minified
        : [...minified, { s: tempString, m: tempMarks }];
};
