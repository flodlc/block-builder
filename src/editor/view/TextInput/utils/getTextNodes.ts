export const getTextNodes = ({ node }: { node: Node }) => {
    let nodes: Node[] = [];
    if (node.nodeType === 3) {
        nodes = [...nodes, node];
    } else {
        if (
            node.nodeType === 1 &&
            (node as HTMLElement).matches('[contentEditable="false"]')
        ) {
            nodes = [...nodes, node];
        } else {
            Array.from(node.childNodes).forEach((child) => {
                nodes = [...nodes, ...getTextNodes({ node: child })];
            });
        }
    }
    return nodes;
};
