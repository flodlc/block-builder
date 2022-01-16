import { Node } from './Node';

export const patchNode = ({
    node,
    patch,
}: {
    node: Node;
    patch: Partial<Pick<Node, 'type' | 'text' | 'attrs'>>;
}) => {
    return node.patch(patch);
};
