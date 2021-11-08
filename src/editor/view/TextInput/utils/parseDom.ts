import { MarkedText } from '../../../model/types';
import { getTextNodes } from './getTextNodes';

export const parseDom = ({ element }: { element: HTMLElement }): MarkedText => {
    const nodes = getTextNodes({ node: element });
    return nodes.map((node) => {
        if (node.nodeType === 3) {
            return { s: node.textContent ?? '', m: getAllMarks(node) };
        } else {
            return {
                s: 'm',
                m: [
                    ...getAllMarks(node),
                    {
                        d: JSON.parse(
                            (node as HTMLElement).getAttribute('data-attrs') ??
                                '{}'
                        ),
                        t:
                            (node as HTMLElement).getAttribute('data-type') ??
                            '',
                    },
                ],
            };
        }
    });
};

const getAllMarks = (domNode: Node) => {
    const marks = [];

    let parentElement = domNode.parentElement;
    while (
        parentElement &&
        !parentElement?.matches('[contenteditable="true"]')
    ) {
        marks.push({
            t: parentElement?.tagName.toLocaleLowerCase() ?? '',
        });
        parentElement = parentElement.parentElement;
    }
    return marks;
};
