import { RefObject, useLayoutEffect, useMemo } from 'react';

export const useTrailingElements = (ref: RefObject<HTMLDivElement>) => {
    const elements = useMemo(() => {
        /**
         * Allow softbreaks
         */
        const br = document.createElement('BR');
        br.setAttribute('data-ignore', 'true');

        return { br };
    }, []);

    useLayoutEffect(() => {
        // firefox add a BR tag sometimes in empty editables
        Array.from(ref.current?.children ?? []).forEach((childElement) => {
            if (childElement.tagName === 'BR' && childElement !== elements.br) {
                childElement.parentElement?.removeChild(childElement);
            }
        });

        if (ref.current?.lastChild !== elements.br) {
            ref.current?.append(elements.br);
        }
    });

    useLayoutEffect(() => {
        return () => {
            const element =
                ref.current?.parentElement?.querySelector('.editable_content');
            if (elements.br.parentElement === element) {
                element?.removeChild(elements.br);
            }
        };
    }, []);
};
