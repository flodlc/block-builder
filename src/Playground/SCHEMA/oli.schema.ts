import { NodeSchema } from '../../editor/model/types';
import { STATE_ERRORS } from '../../editor/model/serlializers/modelNormalizer';

export const oliSchema: NodeSchema = {
    normalize: ({ child, error, transaction, node, state }) => {
        if (error === STATE_ERRORS.INVALID_CHILD && child) {
            child.childrenIds?.forEach((childId) => {
                transaction.insertAfter({
                    parent: node.id,
                    node: state.nodes[childId],
                    after: child.id,
                });
            });
            transaction
                .removeFrom({ nodeId: child.id, parentId: node.id })
                .patch({ nodeId: node.id, patch: { text: child.text } })
                .dispatch();
        }
    },
    serialize: ({ serializedText, serializedChildren, prevNode, nextNode }) => {
        return `${
            prevNode?.type !== 'oli' ? '<ol>' : ''
        }<li>${serializedText}${serializedChildren}</li>${
            nextNode?.type !== 'oli' ? '</ol>' : ''
        }`;
    },
    parse: (node: HTMLElement) => {
        if (!node.matches('ol > li')) return false;
        return {};
    },
    attrs: {},
    allowText: true,
    allowChildren: ['oli', 'uli', 'text', 'heading'],
};
