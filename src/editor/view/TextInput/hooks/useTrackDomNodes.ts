import { RefObject, useLayoutEffect, useRef } from 'react';

type TrackedNodes = Map<Node, TrackedNode>;
type TrackedNode = { node: Node; isReact: boolean; isInDom: boolean };

export const clearTrackedDomNodes = (trackedDomNodes: TrackedNodes) => {
    Array.from(trackedDomNodes.values()).forEach((trackedNode) => {
        if (!trackedNode.isReact && trackedNode.isInDom) {
            trackedNode.node.parentElement?.removeChild(trackedNode.node);
        }
    });
    trackedDomNodes.clear();
};

export const useTrackDomNodes = (ref: RefObject<HTMLDivElement>) => {
    const observer = useRef<MutationObserver>();
    useLayoutEffect(() => {
        observer.current?.takeRecords();
    });

    const trackedNodes = useRef(new Map() as TrackedNodes);

    useLayoutEffect(() => {
        if (!ref.current) return;
        observer.current =
            observer.current ??
            new MutationObserver((entries) => {
                trackedNodes.current = getTrackedNodes(
                    trackedNodes.current,
                    entries
                );
            });
        observer.current.observe(ref.current, {
            childList: true,
            attributes: false,
            characterData: false,
        });
        return () => observer.current?.disconnect();
    }, []);

    const entries = observer.current?.takeRecords();
    trackedNodes.current = getTrackedNodes(trackedNodes.current, entries);

    return trackedNodes;
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
                trackedNode.isInDom = true;
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
                trackedNode.isInDom = false;
            }
        });
    });
    return trackedNodesClone;
};
