import { SCHEMA } from '../../Playground/SCHEMA/SCHEMA';

export type NodeBehaviors = {
    keepFormatOnEnter: boolean;
};

const defaultNodeBehaviors = {
    keepFormatOnEnter: false,
};

const nodesBehaviorsConfig: Record<string, NodeBehaviors> = {
    oli: {
        keepFormatOnEnter: true,
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
