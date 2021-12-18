export const SCHEMA = {
    text: {
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    heading: {
        attrs: {
            level: {
                default: 1,
                required: true,
            },
        },
        allowText: true,
        allowChildren: false,
    },
    divider: {
        attrs: {},
        allowText: false,
        allowChildren: false,
    },
    quote: {
        attrs: {},
        allowText: false,
        allowChildren: true,
    },
    callout: {
        attrs: {
            emoji: {
                required: true,
                default: '😺',
            },
        },
        allowText: false,
        allowChildren: true,
    },
    card: {
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    b: {
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    i: {
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    mention: {
        attrs: {},
        allowText: false,
        allowChildren: false,
    },
    mentionDecoration: {
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
};
