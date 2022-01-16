import { NodeSchema } from '../../editor/model';
import { STATE_ERRORS } from '../../editor/model';

export const headingSchema: NodeSchema = {
    serialize: ({ serializedText, serializedChildren, node }) => {
        const tag = `h${node.attrs?.level ?? 1}`;
        return `<${tag}>${serializedText}</${tag}>${serializedChildren}`;
    },
    parse: (node: HTMLElement) => {
        if (!node.matches('h1, h2, h3, h4, h5, h6')) return false;
        return {
            attrs: {
                level: parseInt(node.tagName.slice(1), 10),
            },
        };
    },
    normalize: ({ child, error, transaction, node, parentId }) => {
        if (error === STATE_ERRORS.INVALID_CHILD && child) {
            if (!parentId) return;
            transaction
                .removeFrom({ parentId: node.id, nodeId: child.id })
                .insertAfter({ parentId, after: node.id, node: child })
                .dispatch();
        }
    },
    attrs: {
        level: {
            default: 1,
            required: true,
        },
    },
    allowText: true,
    allowChildren: false,
};
