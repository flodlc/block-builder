import { NodeSchema } from '../editor/model/types';

export const SCHEMA: Record<string, NodeSchema> = {
    text: {
        parse: (node: HTMLElement) => {
            if (!node.matches('p')) return false;
            return {};
        },
        serialize: ({ serializedText, serializedChildren }) => {
            return `<p>${serializedText}</p>${serializedChildren}`;
        },
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    uli: {
        parse: (node: HTMLElement) => {
            if (!node.matches('ula > li')) return false;
            return {};
        },
        attrs: {},
        allowText: true,
        allowChildren: ['ul', 'ol'],
    },
    oli: {
        serialize: ({
            serializedText,
            serializedChildren,
            prevNode,
            nextNode,
        }) => {
            return `${
                prevNode?.type !== 'oli' ? '<ol>' : ''
            }<li>${serializedText}${serializedChildren}</li>${
                nextNode?.type !== 'oli' ? '</ol>' : ''
            }`;
        },
        parse: (node: HTMLElement) => {
            if (!node.matches('ol > li, ul > li')) return false;
            return {};
        },
        attrs: {},
        allowText: true,
        allowChildren: ['ul', 'ol'],
    },
    heading: {
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
        serialize: () => {
            return `<hr/>`;
        },
        parse: (node: HTMLElement) => {
            if (!node.matches('hr')) return false;
            return {};
        },
        attrs: {},
        allowText: false,
        allowChildren: false,
    },
    quote: {
        serialize: ({ serializedChildren }) => {
            return `${serializedChildren}`;
        },
        parse: (node: HTMLElement) => {
            if (!node.matches('blockquote')) return false;
            return {};
        },
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
        serialize: ({ serializedChildren }) => {
            return `${serializedChildren}`;
        },
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    b: {
        inline: true,
        parse: (node: HTMLElement) => {
            if (!node.matches('b, strong')) return false;
            return {};
        },
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    i: {
        inline: true,
        parse: (node: HTMLElement) => {
            if (!node.matches('i, em')) return false;
            return {};
        },
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    u: {
        inline: true,
        parse: (node: HTMLElement) => {
            if (!node.matches('u')) return false;
            return {};
        },
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
    mention: {
        inline: true,
        attrs: {},
        allowText: false,
        allowChildren: false,
    },
    mentionDecoration: {
        inline: true,
        attrs: {},
        allowText: true,
        allowChildren: true,
    },
};
