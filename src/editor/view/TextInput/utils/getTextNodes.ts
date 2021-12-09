export const getTextNodes = (
    { node, withIgnored = false }: { node: Node; withIgnored?: boolean },
    isRoot = false
) => {
    let nodes: Node[] = [];
    if (node.nodeType === 3) {
        nodes = node.textContent ? [...nodes, node] : nodes;
    } else {
        const element = node as HTMLElement;
        if (
            !withIgnored &&
            node.nodeType === 1 &&
            element.getAttribute('data-ignore')
        ) {
            return nodes;
        }
        if (
            !isRoot &&
            node.nodeType === 1 &&
            (node as HTMLElement).matches('[contentEditable="false"]')
        ) {
            nodes = [...nodes, node];
        } else {
            Array.from(node.childNodes).forEach((child) => {
                nodes = [
                    ...nodes,
                    ...getTextNodes({ node: child, withIgnored }),
                ];
            });
        }
    }
    return nodes;
};
