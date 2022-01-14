import { Mark, MarkedText } from '../../types';

export const minifyMarkedText = (text: MarkedText): MarkedText => {
    const minified: MarkedText = [];
    let tempMarks: Mark[] = [];
    let tempString = '' as string;
    text.forEach((markedNode, i) => {
        const character = markedNode.text as string;
        const charMarks = markedNode.marks ?? [];

        const prev = text[i - 1];

        const canMerge =
            !markedNode.type &&
            !prev?.type &&
            areSameMarkup(charMarks, tempMarks);

        if (markedNode.type) {
            if (tempString.length) {
                minified.push({ text: tempString, marks: tempMarks });
                tempString = '';
                tempMarks = [];
            }
            minified.push({ ...markedNode });
            return;
        }

        if (!tempString.length) {
            tempString += character;
            tempMarks = charMarks;
        } else if (!canMerge) {
            minified.push({ text: tempString, marks: tempMarks });
            tempString = character;
            tempMarks = charMarks;
        } else {
            tempString += character;
        }
    });

    return !tempString
        ? minified
        : [...minified, { text: tempString, marks: tempMarks }];
};

function areSameMarkup(marksA: Mark[], marksB: Mark[]) {
    return (
        marksA.length === marksB.length &&
        (marksA.length === 0 ||
            marksA === marksB ||
            JSON.stringify(marksA) === JSON.stringify(marksB))
    );
}
