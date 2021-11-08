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

        if (!tempString.length) {
            tempString += character;
            tempMarks = [...charMarks];
        } else if (!hasSameMarkup) {
            minified = [...minified, { s: tempString, m: tempMarks }];
            tempString = character;
            tempMarks = [...charMarks];
        } else {
            tempString += character;
        }
    });

    return [...minified, { s: tempString, m: tempMarks }];
};
