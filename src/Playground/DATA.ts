import { MarkedText } from '../editor/model/types';
import { SCHEMA } from './SCHEMA';
import { compileSchema } from '../editor/model/schema';

export const BIG_DATA = (() => {
    const schema = compileSchema({ schema: SCHEMA });
    const nodes: any = {};
    const docNode: any = {
        id: 'doc',
        type: 'card',
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

export const PLAYGROUND_DATA = {
    doc: {
        id: 'doc',
        type: 'card',
        text: [{ s: 'My first note' }],
        childrenIds: [
            'abcaa',
            'sdfsffs',
            'fjsnsjdnf',
            'dsdffze',
            'aqdfsd',
            'abc',
            'skdfsdf',
            'kdsfkdf',
        ],
    },
    abcaa: {
        id: 'abcaa',
        type: 'quote',
        childrenIds: ['bcdaa', 'bcadaa'],
    },
    bcdaa: {
        id: 'bcdaa',
        type: 'text',
        text: [{ s: 'Clipped content from a blog article' }],
    },
    bcadaa: {
        id: 'bcadaa',
        type: 'text',
        text: [{ s: 'Thank you for reading' }],
    },
    sdfsffs: {
        id: 'sdfsffs',
        type: 'heading',
        attrs: { level: 2 },
        text: [
            {
                s: 'How to take smart notes ?',
            },
        ],
    },
    fjsnsjdnf: {
        id: 'fjsnsjdnf',
        type: 'text',
        text: [
            {
                s: 'Harum voluptas eum nulla harum necessitatibus. ',
            },
        ],
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
        text: [],
    },
    abc: {
        id: 'abc',
        type: 'callout',
        attrs: { emoji: '👽' },
        childrenIds: ['bcd'],
    },
    skdfsdf: {
        id: 'skdfsdf',
        type: 'text',
        text: [],
    },
    bcd: {
        id: 'bcd',
        type: 'text',
        text: [{ s: 'Child of callout' }],
    },
    dsdffze: {
        id: 'dsdffze',
        type: 'text',
        text: [
            {
                s: 'Expedita cupiditate facilis ut minus neque. Eum ut non ipsa debitis.',
            },
        ],
    },
};
