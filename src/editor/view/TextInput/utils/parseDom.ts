import { MarkedText } from '../../../model/types';
import { getTextNodes } from './getTextNodes';
import { splitMarkedText } from '../../../transaction/MarkedText/splitMarkedText';
import { minifyMarkedText } from '../../../transaction/MarkedText/minifyMarkedText';

export const parseDom = ({ element }: { element: HTMLElement }): MarkedText => {
    const nodes = getTextNodes({ node: element });
    const parsed = nodes.map((node) => {
        if (node.nodeType === 3) {
            return {
                s: node.textContent?.replace(/\uFEFF/g, '') ?? '',
                m: getAllMarks(node),
            };
        } else {
            const type = (node as HTMLElement).getAttribute('data-type');
            if (!type) throw 'Missing data-type attribute';
            return {
                s: '•',
                m: [
                    ...getAllMarks(node),
                    {
                        t: type,
                    },
                ],
            };
        }
    });
    return minifyMarkedText(splitMarkedText(parsed));
};

const getAllMarks = (domNode: Node) => {
    const marks = [];
    let parentElement = domNode.parentElement;
    while (parentElement && !parentElement?.matches('.editable_content')) {
        const type = parentElement.getAttribute('data-type');
        // if (!type) throw 'Missing data-type attribute';
        if (type) {
            marks.push({
                t: type,
            });
        }
        parentElement = parentElement.parentElement;
    }
    return marks;
};

export const isDomUpToDate = (modelValue: MarkedText, element: HTMLElement) => {
    const parsedValue = parseDom({ element });
    if (modelValue.length !== parsedValue.length) return false;
    for (let i = 0; i < modelValue.length; i++) {
        const modelNode = modelValue[i];
        const parsedNode = parsedValue[i];
        if (modelNode.s !== parsedNode.s) {
            return false;
        }
        if ((modelNode.m?.length ?? 0) !== (parsedNode.m?.length ?? 0)) {
            return false;
        }
        for (let j = 0; j < (modelNode.m?.length ?? 0) - 1; j++) {
            if (modelNode.m?.[i]?.t !== parsedNode.m?.[i]?.t) {
                return false;
            }
        }
    }
    return true;
};
