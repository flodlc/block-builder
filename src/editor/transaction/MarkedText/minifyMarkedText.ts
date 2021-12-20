import { Mark, MarkedText } from '../../model/types';

export const minifyMarkedText = (text: MarkedText): MarkedText => {
    // console.trace();
    const minified: MarkedText = [];
    let tempMarks: Mark[] = [];
    let tempString = '' as string;
    text.forEach((markedNode, i) => {
        const character = markedNode.s as string;
        const charMarks = markedNode.m ?? [];

        const prev = text[i - 1];

        const canMerge =
            character !== '•' &&
            prev?.s !== '•' &&
            areSameMarkup(charMarks, tempMarks);

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
