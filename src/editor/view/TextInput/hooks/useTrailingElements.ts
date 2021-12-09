import { RefObject, useLayoutEffect, useMemo } from 'react';
import { splitMarkedText } from '../../../transaction/MarkedText/splitMarkedText';
import { MarkedText } from '../../../model/types';

export const useTrailingElements = (
    ref: RefObject<HTMLDivElement>,
    value: MarkedText
) => {
    const elements = useMemo(() => {
        /**
         * Allow softbreaks
         */
        const br = document.createElement('BR');
        br.setAttribute('data-ignore', 'true');

        /**
         * Allow cursor at the last of the line if ast node is not editable
         */
        const img = document.createElement('IMG');
        img.setAttribute('data-ignore', 'true');

        /**
         * Used to allow deleting before until the start of the line if first node is not editable on long backspace on iphone
         */
        const startImg = document.createElement('IMG');
        startImg.setAttribute('data-ignore', 'true');
        return {
            img,
            br,
            startImg,
        };
    }, []);

    useLayoutEffect(() => {
        const splitted = splitMarkedText(value ?? []);
        const needsTrailingLine =
            !splitted.length || splitted?.[splitted.length - 1]?.s === '\n';
        const needsTrailingImg = splitted?.[splitted.length - 1]?.s === '•';
        const needsStartingImg = splitted?.[0]?.s === '•' && 1 === 2 + 2;

        // firefox add a BR tag sometimes in empty editables
        Array.from(ref.current?.children ?? []).forEach((childElement) => {
            if (childElement.tagName === 'BR' && childElement !== elements.br) {
                childElement.parentElement?.removeChild(childElement);
            }
        });

        if (needsTrailingLine) {
            ref.current?.append(elements.br);
        } else if (elements.br.parentElement === ref.current) {
            ref.current?.removeChild(elements.br);
        }
        if (needsTrailingImg) {
            ref.current?.append(elements.img);
        } else if (elements.img.parentElement === ref.current) {
            ref.current?.removeChild(elements.img);
        }
        if (needsStartingImg) {
            ref.current?.prepend(elements.startImg);
        } else if (elements.startImg.parentElement === ref.current) {
            ref.current?.removeChild(elements.startImg);
        }
    });

    useLayoutEffect(() => {
        // ref.current?.prepend(elements.startImg);
        return () => {
            const element =
                ref.current?.parentElement?.querySelector('.editable_content');
            if (elements.br.parentElement === element) {
                element?.removeChild(elements.br);
            }
            if (elements.img.parentElement === element) {
                element?.removeChild(elements.img);
            }
            if (elements.startImg.parentElement === element) {
                element?.removeChild(elements.startImg);
            }
        };
    }, []);
};
