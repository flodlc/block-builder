import { RefObject, useLayoutEffect, useRef } from 'react';

export type DomScreenShot = { node: Node; text?: string }[];

export const useReactScreenshot = (
    ref: RefObject<HTMLDivElement>,
    willUpdate: boolean
) => {
    const screenshot = useRef<DomScreenShot>();
    useLayoutEffect(() => {
        if (willUpdate || !screenshot.current) {
            screenshot.current = Array.from(ref.current?.childNodes ?? []).map(
                (node) => ({
                    node,
                    text:
                        node.nodeType === 3
                            ? node.textContent ?? undefined
                            : undefined,
                })
            );
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
    screenshot: DomScreenShot
) => {
    for (let i = screenshot.length - 1; i >= 0; i--) {
        const nodeScreenShot = screenshot[i];
        const nextNodeScreenShot = screenshot[i + 1];
        if (
            nodeScreenShot.node.nextSibling !== nextNodeScreenShot?.node ??
            null
        ) {
            element?.insertBefore(
                nodeScreenShot.node,
                nextNodeScreenShot?.node ?? null
            );
        }
        if (
            nodeScreenShot.node.nodeType === 3 &&
            nodeScreenShot.node.textContent !== nodeScreenShot.text
        ) {
            const textNode = nodeScreenShot.node as Text;
            textNode.replaceData(
                0,
                textNode.length,
                nodeScreenShot.text as string
            );
        }
    }
};
