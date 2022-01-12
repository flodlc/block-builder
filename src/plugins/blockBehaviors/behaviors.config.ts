import { SCHEMA } from '../../Playground/SCHEMA/SCHEMA';
import { Node } from '../../editor/model/types';

export type NodeBehaviors = {
    keepFormatOnEnter: boolean;
    childrenOnEnter: ({ node }: { node: Node }) => boolean;
};

const defaultNodeBehaviors = {
    keepFormatOnEnter: false,
    childrenOnEnter: () => false,
};

const nodesBehaviorsConfig: Record<string, Partial<NodeBehaviors>> = {
    oli: {
        keepFormatOnEnter: true,
    },
    uli: {
        keepFormatOnEnter: true,
    },
    toggleList: {
        childrenOnEnter: ({ node }: { node: Node }) => {
            return true;
        },
    },
};

export const nodesBehaviors = (() => {
    return Object.keys(SCHEMA).reduce(
        (acc, type) => ({
            ...acc,
            [type]: { ...defaultNodeBehaviors, ...nodesBehaviorsConfig[type] },
        }),
        nodesBehaviorsConfig
    );
})();
