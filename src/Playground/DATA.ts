import { MarkedText } from '../editor/model/types';
import { SCHEMA } from './SCHEMA';
import { compileSchema } from '../editor/model/schema';

export const BIG_DATA = (() => {
    const schema = compileSchema({ schema: SCHEMA });
    const nodes: any = {};
    const docNode: any = {
        id: 'doc',
        type: 'card',
        text: [{ s: 'My big note', m: [] }],
        childrenIds: [],
    };
    nodes['doc'] = docNode;
    for (let i = 0; i < 1000; i++) {
        const newNode = schema.text.create();
        newNode.text = [
            {
                s: 'Suite aux faux pas de Nice, le club rhodanien voulait faire la bonne opération dans la course au podium.',
            },
        ] as MarkedText;
        docNode.childrenIds.push(newNode.id);
        nodes[newNode.id] = newNode;
    }
    return nodes;
})();

export const SINGLE_TEXT_DATA = {
    doc: {
        id: 'doc',
        type: 'text',
        text: [{ s: 'My first note' }],
    },
};

export const PLAYGROUND_DATA = {
    doc: {
        id: 'doc',
        type: 'card',
        text: [{ s: 'My note', m: [] }],
        childrenIds: [
            'c4e3f5b0-53d8-4123-aa94-20f01328477a',
            'bd80a80b-177c-4df4-a34d-55ed10d3cc5d',
            '1907f312-3972-4263-8f77-2f58c6eeb188',
            'abcaa',
            'sdfsffs',
            'fjsnsjdnf',
            'dsdffze',
            'diviii',
            'aqdfsd',
            'spoasdsdf',
            'abc',
            'skdfsdf',
            'kdsfkdf',
        ],
    },
    abcaa: { id: 'abcaa', type: 'quote', childrenIds: ['bcdaa', 'bcadaa'] },
    bcdaa: {
        id: 'bcdaa',
        type: 'text',
        text: [{ s: 'Clipped content from a blog article' }],
    },
    bcadaa: {
        id: 'bcadaa',
        type: 'text',
        text: [{ s: 'Here is a mention', m: [] }],
    },
    sdfsffs: {
        id: 'sdfsffs',
        type: 'heading',
        attrs: { level: 2 },
        text: [{ s: 'How to take smart notes ?' }],
    },
    fjsnsjdnf: {
        id: 'fjsnsjdnf',
        type: 'text',
        text: [{ s: 'Harum voluptas eum nulla harum necessitatibus.' }],
    },
    kdsfkdf: {
        id: 'kdsfkdf',
        type: 'text',
        text: [
            {
                s: 'Harum voluptas eum nulla harum necessitatibus. Corrupti fugiat modi doloribus officia voluptatem suscipit.',
            },
        ],
    },
    aqdfsd: {
        id: 'aqdfsd',
        type: 'text',
        text: [
            {
                s: 'Let’s look at how a single source can proceed through the layers of progressive summarization.',
            },
        ],
    },
    abc: {
        id: 'abc',
        type: 'callout',
        attrs: { emoji: '👽' },
        childrenIds: ['bcd'],
    },
    spoasdsdf: { id: 'spoasdsdf', type: 'text', text: [] },
    skdfsdf: { id: 'skdfsdf', type: 'text', text: [] },
    bcd: { id: 'bcd', type: 'text', text: [{ s: 'Child of callout' }] },
    diviii: { id: 'diviii', type: 'divider' },
    dsdffze: {
        id: 'dsdffze',
        type: 'text',
        text: [
            {
                s: 'Expedita cupiditate facilis ut minus neque. Eum ut non ipsa debitis.',
            },
        ],
    },
    'c4e3f5b0-53d8-4123-aa94-20f01328477a': {
        id: 'c4e3f5b0-53d8-4123-aa94-20f01328477a',
        type: 'text',
        text: [
            {
                s: '•',
                m: [
                    {
                        t: 'mention',
                        d: {
                            value: {
                                type: 'date',
                                date: '2021-12-06T16:46:35.813Z',
                            },
                        },
                    },
                ],
            },
            { s: ' ', m: [] },
        ],
        childrenIds: [],
        attrs: {},
    },
    'bd80a80b-177c-4df4-a34d-55ed10d3cc5d': {
        id: 'bd80a80b-177c-4df4-a34d-55ed10d3cc5d',
        type: 'text',
        text: [
            {
                s: '•',
                m: [
                    {
                        t: 'mention',
                        d: { value: { type: 'person', name: 'Florian' } },
                    },
                ],
            },
            ...new Array(600).fill(0).flatMap(() => [
                {
                    s: 'bold ',
                    m: [
                        {
                            t: 'b',
                        },
                    ],
                },
                {
                    s: 'italic ',
                    m: [
                        {
                            t: 'i',
                        },
                    ],
                },
            ]),
            { s: ' ', m: [] },
            {
                s: '•',
                m: [
                    {
                        t: 'mention',
                        d: { value: { type: 'person', name: 'Mike' } },
                    },
                ],
            },
            { s: ' ', m: [] },
            {
                s: '•',
                m: [
                    {
                        t: 'mention',
                        d: { value: { type: 'person', name: 'Tyson' } },
                    },
                ],
            },
            { s: ' ', m: [] },
        ],
        childrenIds: [],
        attrs: {},
    },
    '1907f312-3972-4263-8f77-2f58c6eeb188': {
        id: '1907f312-3972-4263-8f77-2f58c6eeb188',
        type: 'text',
        text: [],
        childrenIds: [],
        attrs: {},
    },
};
