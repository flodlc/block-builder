import { MutableRefObject, RefObject, useLayoutEffect, useRef } from 'react';

type DomChanges = { func: () => void; log: any }[];
type ChangesTracker = { observer: MutationObserver; domChanges: DomChanges };

export const useTrackDomChanges = (ref: RefObject<HTMLDivElement>) => {
    const changesTracker = useRef<ChangesTracker>({
        observer: undefined as unknown as MutationObserver,
        domChanges: [],
    });

    useLayoutEffect(() => {
        changesTracker.current.observer =
            changesTracker.current.observer ??
            new MutationObserver((entries) => {
                changesTracker.current.domChanges.push(
                    ...getReversedMutations(entries)
                );
            });

        if (ref.current) {
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
        }
        return () => {
            changesTracker.current.observer?.disconnect();
        };
    }, [ref.current]);
    changesTracker.current.domChanges.push(
        ...getReversedMutations(
            changesTracker.current.observer?.takeRecords() ?? []
        )
    );
    return changesTracker;
};

const getReversedMutations = (entries: MutationRecord[]) => {
    const domChanges = [] as { func: () => void; log: any }[];
    entries.forEach((entry) => {
        if (entry.type === 'characterData') {
            domChanges.push({
                func: () =>
                    (entry.target as Text).replaceData(
                        0,
                        entry.target.textContent?.length ?? 0,
                        entry.oldValue ?? ''
                    ),
                log: { type: 'replace text', value: entry.oldValue },
            });
        }

        if (entry.type === 'childList') {
            if (entry.addedNodes.length) {
                entry.addedNodes.forEach((addedNode) => {
                    domChanges.push({
                        func: () => entry.target?.removeChild(addedNode),
                        log: { type: 'remove', addedNode },
                    });
                });
            }
            if (entry.removedNodes.length) {
                entry.removedNodes.forEach((removedNode) => {
                    domChanges.push({
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

export const resetChangesTracking = (
    changesTracker: MutableRefObject<ChangesTracker>
) => {
    changesTracker.current.domChanges = [];
    changesTracker.current.observer?.takeRecords();
};

export const restoreDom = (
    changesTracker: MutableRefObject<ChangesTracker>
) => {
    changesTracker.current.domChanges.reverse().forEach((item) => item.func());
    changesTracker.current.domChanges = [];
};
