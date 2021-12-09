import { RefObject, useLayoutEffect, useState } from 'react';

type TrackedNodes = Map<Node, TrackedNode>;
type TrackedNode = { node: Node; isReact: boolean; isInDom: boolean };

export const clearTrackedDomNodes = (
    trackedDomNodes: TrackedNodes,
    element: HTMLElement | null
) => {
    Array.from(trackedDomNodes.values()).forEach((trackedNode) => {
        if (trackedNode.isReact && !trackedNode.isInDom) {
            element?.append(trackedNode.node);
        } else if (!trackedNode.isReact && trackedNode.isInDom) {
            trackedNode.node.parentElement?.removeChild(trackedNode.node);
        }
    });
    trackedDomNodes.clear();
};

export const useTrackDomNodes = (ref: RefObject<HTMLDivElement>) => {
    const [reactRender] = useState({
        observer: undefined as MutationObserver | undefined,
    });

    useLayoutEffect(() => {
        reactRender.observer?.takeRecords();
    });

    const [temp] = useState({
        trackedNodes: new Map() as TrackedNodes,
    });

    useLayoutEffect(() => {
        if (!ref.current) return;
        reactRender.observer = new MutationObserver((entries) => {
            temp.trackedNodes = getTrackedNodes(temp.trackedNodes, entries);
        });
        reactRender.observer.observe(ref.current, {
            childList: true,
            subtree: true,
        });
        return () => reactRender.observer?.disconnect();
    }, []);

    const entries = reactRender.observer?.takeRecords();
    temp.trackedNodes = getTrackedNodes(temp.trackedNodes, entries);

    return temp;
};

const getTrackedNodes = (
    trackedNodes: TrackedNodes,
    entries: MutationRecord[] = []
) => {
    const trackedNodesClone = new Map(trackedNodes);
    entries.forEach((entry) => {
        entry.addedNodes.forEach((node) => {
            const trackedNode = trackedNodesClone.get(node);
            if (trackedNode) {
                trackedNodesClone.set(node, {
                    ...trackedNode,
                    isInDom: true,
                });
            } else {
                trackedNodesClone.set(node, {
                    node,
                    isReact: false,
                    isInDom: true,
                });
            }
        });

        entry.removedNodes.forEach((node) => {
            const trackedNode = trackedNodesClone.get(node);
            if (!trackedNode) {
                trackedNodesClone.set(node, {
                    node,
                    isReact: true,
                    isInDom: false,
                });
            } else {
                trackedNodesClone.set(node, {
                    ...trackedNode,
                    isInDom: false,
                });
            }
        });
    });
    return trackedNodesClone;
};
