export const findDeepTarget = (nodeId: string, direction: -1 | 1) => {
    const editables = document.querySelectorAll('[contenteditable="true"]');

    const currentIndex = Array.from(editables).findIndex(
        (editable) =>
            editable.closest('[data-uid]')?.getAttribute('data-uid') === nodeId
    );
    const element = editables[currentIndex + direction] as HTMLDivElement;
    const id = element?.closest('[data-uid]')?.getAttribute('data-uid');

    if (!id || !element) return;
    return {
        id,
        element,
    };
};
