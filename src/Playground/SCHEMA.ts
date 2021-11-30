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
        attrs: {
            emoji: {
                required: true,
                default: '😺',
            },
        },
        allowText: true,
        allowChildren: true,
    },
};
