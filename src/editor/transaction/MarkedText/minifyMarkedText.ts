import { Mark, MarkedText } from '../../model/types';

export const minifyMarkedText = (text: MarkedText): MarkedText => {
    const minified: MarkedText = [];
    let tempMarks: Mark[] = [];
    let tempString = '' as string;
    text.forEach((markedNode) => {
        const character = markedNode.s as string;
        const charMarks = markedNode.m ?? [];

        const canMerge =
            character !== '•' && areSameMarkup(charMarks, tempMarks);

        if (!tempString.length) {
            tempString += character;
            tempMarks = charMarks;
        } else if (!canMerge) {
            minified.push({ s: tempString, m: tempMarks });
            tempString = character;
            tempMarks = charMarks;
        } else {
            tempString += character;
        }
    });

    return !tempString
        ? minified
        : [...minified, { s: tempString, m: tempMarks }];
};

function areSameMarkup(marksA: Mark[], marksB: Mark[]) {
    return (
        marksA.length === marksB.length &&
        (marksA.length === 0 ||
            JSON.stringify(marksA) === JSON.stringify(marksB))
    );
}
