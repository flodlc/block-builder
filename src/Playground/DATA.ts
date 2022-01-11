import { CompiledNodeSchema, MarkedText, Node } from '../editor/model/types';
import { compileSchema } from '../editor/model/schema';
import { SCHEMA } from './SCHEMA/SCHEMA';

export const BIG_DATA = (() => {
    const schema = compileSchema({ schema: SCHEMA });
    const nodes: any = {};
    const docNode: any = {
        id: 'doc',
        type: 'card',
        text: [{ text: 'My big note', marks: [] }],
        childrenIds: [],
    };
    nodes['doc'] = docNode;
    for (let i = 0; i < 1000; i++) {
        const textSchema = schema.text as CompiledNodeSchema;
        const newNode = textSchema.create();
        newNode.text = [
            {
                text: 'Suite aux faux pas de Nice, le club rhodanien voulait faire la bonne opération dans la course au podium.',
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
        text: [{ text: 'My first note' }],
    },
};

export const PLAYGROUND_DATA: Record<string, Node> = {
    doc: {
        id: 'doc',
        type: 'card',
        text: [{ text: 'My note', marks: [] }],
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
        text: [{ text: 'Clipped content from a blog article' }],
    },
    bcadaa: {
        id: 'bcadaa',
        type: 'text',
        text: [{ text: 'Here is a mention', marks: [] }],
    },
    sdfsffs: {
        id: 'sdfsffs',
        type: 'heading',
        attrs: { level: 2 },
        text: [{ text: 'How to take smart notes ?' }],
    },
    fjsnsjdnf: {
        id: 'fjsnsjdnf',
        type: 'text',
        text: [
            {
                text: 'Harum voluptas eum nulla harum necessitatibus.',
            },
        ],
    },
    kdsfkdf: {
        id: 'kdsfkdf',
        type: 'text',
        text: [
            {
                text: 'Harum voluptas eum nulla harum necessitatibus. Corrupti fugiat modi doloribus officia voluptatem suscipit.',
            },
        ],
    },
    aqdfsd: {
        id: 'aqdfsd',
        type: 'text',
        text: [
            {
                text: 'Let’s look at how a single source can proceed through the layers of progressive summarization.',
            },
        ],
    },
    abc: {
        id: 'abc',
        type: 'callout',
        attrs: { emoji: '👽' },
        childrenIds: ['bcd'],
    },
    spoasdsdf: { id: 'spoasdsdf', text: [], type: 'text' },
    skdfsdf: { id: 'skdfsdf', text: [], type: 'text' },
    bcd: {
        id: 'bcd',
        type: 'text',
        text: [{ text: 'Child of callout' }],
    },
    diviii: { id: 'diviii', type: 'divider' },
    dsdffze: {
        id: 'dsdffze',
        type: 'text',
        text: [
            {
                text: 'Expedita cupiditate facilis ut minus neque. Eum ut non ipsa debitis.',
            },
        ],
    },
    'c4e3f5b0-53d8-4123-aa94-20f01328477a': {
        id: 'c4e3f5b0-53d8-4123-aa94-20f01328477a',
        type: 'text',
        text: [
            {
                text: '•',
                type: 'mention',
                attrs: {
                    type: 'date',
                    date: '2021-12-06T16:46:35.813Z',
                },
            },
            { text: ' ', marks: [] },
        ],
        childrenIds: [],
        attrs: {},
    },
    'bd80a80b-177c-4df4-a34d-55ed10d3cc5d': {
        id: 'bd80a80b-177c-4df4-a34d-55ed10d3cc5d',
        type: 'text',
        text: [
            {
                text: '•',
                type: 'mention',
                attrs: { type: 'person', name: 'Florian' },
            },
            ...new Array(0).fill(0).flatMap(() => [
                {
                    text: 'bold bold ',
                    m: [
                        {
                            type: 'b',
                        },
                    ],
                },
                {
                    text: 'italic italic ',
                    m: [
                        {
                            type: 'i',
                        },
                    ],
                },
                {
                    text: 'bold bold \n',
                    m: [
                        {
                            type: 'b',
                        },
                    ],
                },
            ]),
            { text: ' ', m: [] },
            {
                text: '•',
                type: 'mention',
                attrs: { type: 'person', name: 'Mike' },
            },
            { text: ' ', m: [] },
            {
                text: '•',
                attrs: { type: 'person', name: 'Tyson' },
                type: 'mention',
            },
            { text: ' ', m: [] },
        ],
        childrenIds: [],
        attrs: {},
    },
    '1907f312-3972-4263-8f77-2f58c6eeb188': {
        id: '1907f312-3972-4263-8f77-2f58c6eeb188',
        type: 'image',
        text: [],
        childrenIds: [],
        attrs: {
            src: 'https://media.istockphoto.com/photos/taxis-in-times-square-with-7th-avenue-new-york-city-manhattan-picture-id1277102943?b=1&k=20&m=1277102943&s=170667a&w=0&h=tp_vCWDpgrKsUBtl2ZI-8yy2fMHtoZJPcaZBTcnN9nc=',
        },
    },
};
