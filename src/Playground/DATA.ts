import { SCHEMA } from '../components/schema';
import { MarkedText } from '../editor/model/types';

export const BIG_DATA = (() => {
    const nodes: any = {};
    const docNode: any = {
        id: 'doc',
        type: 'doc',
        childrenIds: [],
    };
    nodes['doc'] = docNode;
    for (let i = 0; i < 1000; i++) {
        const newNode = SCHEMA.text.create();
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
        type: 'doc',
        childrenIds: [
            'aqdfsd',
            'sdfsffs',
            'fjsnsjdnf',
            'dsdffze',
            'abc',
            'mamma',
            'njnfjn',
        ],
    },
    aqdfsd: {
        id: 'aqdfsd',
        type: 'text',
        text: [
            {
                s: 'Quas praesentium culpa dolor qui. Qui quia velit qui molestias est maiores excepturi consequatur.',
            },
        ],
    },
    fjsnsjdnf: {
        id: 'fjsnsjdnf',
        type: 'text',
        text: [
            {
                s: 'Harum voluptas eum nulla harum necessitatibus. Corrupti fugiat modi doloribus officia voluptatem suscipit.',
            },
        ],
    },
    sdfsffs: {
        id: 'sdfsffs',
        type: 'text',
        text: [
            {
                s: 'Alias veniam hic consequuntur molestiae est. Est dicta qui rerum hic illum.',
            },
        ],
    },
    mamma: {
        id: 'mamma',
        type: 'toggle',
        text: [{ s: 'Toggle list' }],
        childrenIds: ['poa'],
    },
    abc: {
        id: 'abc',
        type: 'callout',
        childrenIds: ['bcd'],
    },
    bcd: {
        id: 'bcd',
        type: 'text',
        text: [{ s: 'Child of callout' }],
    },
    poa: {
        id: 'poa',
        type: 'text',
        text: [{ s: 'Child' }],
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
    njnfjn: {
        id: 'njnfjn',
        type: 'button',
    },
};
