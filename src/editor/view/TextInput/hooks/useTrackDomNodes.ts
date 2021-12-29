import { RefObject, useLayoutEffect, useRef } from 'react';

export type DomChanges = {
    type: string;
    func: () => void;
    log: any;
    entry: MutationRecord;
}[];
type ChangesTracker = {
    observer: MutationObserver;
    domChanges: DomChanges;
    listen: () => void;
    pause: () => void;
    restoreDom: () => void;
    removeAddedElements: () => void;
    restoreChildren: () => void;
    resetTracking: () => void;
};

export const useTrackDomChanges = (
    ref: RefObject<HTMLDivElement>,
    onMutation: (domChanges: DomChanges) => boolean = () => true
) => {
    const listening = useRef(false);
    const changesTracker = useRef<ChangesTracker>({
        observer: undefined as unknown as MutationObserver,
        listen: () => {
            if (listening.current) return;
            changesTracker.current.observer.takeRecords();
            changesTracker.current.observer.observe(
                ref.current as HTMLElement,
                {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true,
                    characterDataOldValue: true,
                }
            );
            listening.current = true;
        },
        pause: () => {
            if (!listening.current) return;
            const records = changesTracker.current.observer?.takeRecords();
            if (records.length) {
                changesTracker.current.domChanges =
                    changesTracker.current.domChanges.concat(
                        getReversedMutations(records)
                    );
            }
            changesTracker.current.observer.disconnect();
            listening.current = false;
        },
        domChanges: [],
        restoreDom: () => {
            changesTracker.current.domChanges
                .slice()
                .reverse()
                .forEach((item) => item.func());
            changesTracker.current.domChanges = [];
            changesTracker.current.observer?.takeRecords();
        },
        removeAddedElements: () => {
            const addedElements = [];
            changesTracker.current.domChanges
                .filter((item) => item.type === 'added_element')
                .reverse()
                .forEach((domChange) => {
                    addedElements.push(domChange.entry.addedNodes);
                    domChange.func();
                });
            changesTracker.current.observer?.takeRecords();
            changesTracker.current.domChanges =
                changesTracker.current.domChanges.filter(
                    (item) => item.type !== 'added_element'
                );
        },
        restoreChildren: () => {
            const types = [
                'added_element',
                'removed_element',
                'added_text',
                'removed_text',
            ];
            const childMutations = changesTracker.current.domChanges.filter(
                (item) => types.indexOf(item.type) > -1
            );
            childMutations.reverse().forEach((item) => item.func());
            changesTracker.current.observer?.takeRecords();
            changesTracker.current.domChanges =
                changesTracker.current.domChanges.filter(
                    (item) => types.indexOf(item.type) === -1
                );
        },
        resetTracking: () => {
            changesTracker.current.domChanges = [];
            changesTracker.current.observer?.takeRecords();
        },
    });

    useLayoutEffect(() => {
        changesTracker.current.observer =
            changesTracker.current.observer ??
            new MutationObserver((entries) => {
                const domChanges = getReversedMutations(entries);
                // changesTracker.current.removeAddedElements();
                if (onMutation(domChanges)) {
                    changesTracker.current.domChanges =
                        changesTracker.current.domChanges.concat(domChanges);
                } else {
                    domChanges
                        .reverse()
                        .forEach((domChange) => domChange.func());
                    changesTracker.current.observer.takeRecords();
                }
            });
        return () => {
            changesTracker.current.pause();
        };
    }, []);
    return changesTracker;
};

const getReversedMutations = (entries: MutationRecord[]) => {
    const domChanges = [] as DomChanges;
    entries.forEach((entry) => {
        if (entry.type === 'characterData') {
            domChanges.push({
                type: 'char',
                entry,
                func: () => {
                    (entry.target as Text).replaceData(
                        0,
                        entry.target.textContent?.length ?? 0,
                        entry.oldValue ?? ''
                    );
                },
                log: { type: 'replace text', value: entry.oldValue },
            });
        }

        if (entry.type === 'childList') {
            if (entry.addedNodes.length) {
                entry.addedNodes.forEach((addedNode) => {
                    domChanges.push({
                        type:
                            addedNode.nodeType === 3
                                ? 'added_text'
                                : 'added_element',
                        entry,
                        func: () => entry.target?.removeChild(addedNode),
                        log: { type: 'remove', addedNode },
                    });
                });
            }
            if (entry.removedNodes.length) {
                entry.removedNodes.forEach((removedNode) => {
                    domChanges.push({
                        type:
                            removedNode.nodeType === 3
                                ? 'removed_text'
                                : 'removed_element',
                        entry,
                        func: () =>
                            entry.target?.insertBefore(
                                removedNode,
                                entry.nextSibling
                            ),
                        log: { type: 'insert', removedNode },
                    });
                });
            }
        }
    });
    return domChanges;
};
