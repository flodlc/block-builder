import { RefObject, useLayoutEffect, useRef } from 'react';

export const useReactScreenshot = (
    ref: RefObject<HTMLDivElement>,
    willUpdate: boolean
) => {
    const screenshot = useRef<Node[]>();
    useLayoutEffect(() => {
        if (willUpdate || !screenshot.current) {
            screenshot.current = Array.from(ref.current?.childNodes ?? []);
        }
    });

    useLayoutEffect(() => {
        return () => {
            screenshot.current = [];
        };
    }, []);
    return screenshot;
};

export const restoreReactScreenshot = (
    element: HTMLElement,
    screenshot: Node[]
) => {
    for (let i = screenshot.length - 1; i >= 0; i--) {
        const node = screenshot[i] ?? null;
        const nextNode = screenshot[i + 1] ?? null;
        if (node.nextSibling !== nextNode) {
            element?.insertBefore(node, nextNode);
        }
    }
};
