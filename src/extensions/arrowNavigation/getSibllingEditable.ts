export function getSiblingEditable(diff: number) {
    const currentNode = document.getSelection()?.focusNode;
    const selector = '[contenteditable="true"]';
    if (!currentNode) {
        return;
    }
    const editableElements = document.querySelectorAll(selector);
    const currentIndex = Array.from(editableElements).findIndex((element) =>
        element.contains(currentNode)
    );
    return editableElements[currentIndex + diff];
}
