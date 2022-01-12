import { SCHEMA } from '../../Playground/SCHEMA/SCHEMA';

export type NodeBehaviors = {
    keepFormatOnEnter: boolean;
    resetOnEmptyEnter: boolean;
    unwrapOnBackspaceParent: boolean;
};

const defaultNodeBehaviors = {
    keepFormatOnEnter: false,
    resetOnEmptyEnter: false,
    unwrapOnBackspaceParent: true,
    insertAsChild: true,
};

const nodesBehaviorsConfig: Record<string, Partial<NodeBehaviors>> = {
    oli: {
        keepFormatOnEnter: true,
        resetOnEmptyEnter: true,
    },
    uli: {
        keepFormatOnEnter: true,
        resetOnEmptyEnter: true,
    },
    toggleList: {
        keepFormatOnEnter: true,
        resetOnEmptyEnter: true,
        unwrapOnBackspaceParent: true,
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
