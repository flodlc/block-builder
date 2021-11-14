import { v4 as uuidv4 } from 'uuid';

export const SCHEMA = {
    text: {
        create: () => ({
            id: uuidv4(),
            type: 'text',
            text: [{ s: 'salutation ' }],
        }),
    },
    toggle: {
        create: () => ({
            id: uuidv4(),
            type: 'toggle',
            text: [{ s: 'salutation ', m: [{ t: 'b' }] }],
            childrenIds: [],
        }),
    },
    button: {
        create: () => ({
            id: uuidv4(),
            type: 'button',
        }),
    },
};
