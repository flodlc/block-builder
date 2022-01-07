export const getTextNodes = (
    { node, withIgnored = false }: { node: Node; withIgnored?: boolean },
    isRoot = false
) => {
    const nodes: Node[] = [];
    if (node.nodeType === 3) {
        if (node.textContent) {
            nodes.push(node);
        }
    } else {
        const element = node as HTMLElement;
        if (
            !withIgnored &&
            node.nodeType === 1 &&
            element.matches('[data-ignore="true"]')
        ) {
            return nodes;
        }
        if (
            !isRoot &&
            node.nodeType === 1 &&
            (node as HTMLElement).matches('[data-nodeview="true"]')
        ) {
            nodes.push(node);
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                nodes.push(...getTextNodes({ node: child, withIgnored }));
            }
        }
    }
    return nodes;
};
