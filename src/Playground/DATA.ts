import { SCHEMA } from '../components/schema';

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
        newNode.text =
            'Et occaecati consequuntur illum enim optio. Et et earum vitae ut. Ipsa tempore quia quos nostrum quo a. Voluptas dolor molestiae hic enim at alias eos voluptatem. Earum labore dolor omnis aut ut.';
        docNode.childrenIds.push(newNode.id);
        nodes[newNode.id] = newNode;
    }
    return nodes;
})();

export const PLAYGROUND_DATA = {
    doc: {
        id: 'doc',
        type: 'doc',
        childrenIds: ['aqdfsd', 'njnfjn', 'abc', 'mamma', 'sdfkjsdkfj'],
    },
    aqdfsd: {
        id: 'aqdfsd',
        type: 'text',
        text: 'text',
    },
    mamma: {
        id: 'mamma',
        type: 'titledList',
        text: [
            {
                text: 'A Toggle is a text + children <strong>This is bold</strong> ',
            },
            { component: 'reference' },
            { text: 'some other text' },
        ],
        childrenIds: ['poa'],
    },
    sdfkjsdkfj: {
        id: 'sdfkjsdkfj',
        type: 'callout',
        childrenIds: ['dsdffze'],
    },
    abc: {
        id: 'abc',
        type: 'callout',
        childrenIds: ['bcd'],
    },
    bcd: {
        id: 'bcd',
        type: 'text',
        text: 'text',
    },
    poa: {
        id: 'poa',
        type: 'text',
        text: 'text',
    },
    dsdffze: {
        id: 'dsdffze',
        type: 'text',
        text: 'text',
    },
    njnfjn: {
        id: 'njnfjn',
        type: 'button',
    },
};
