import { v4 as uuidv4 } from 'uuid';

export const SCHEMA = {
    text: {
        create: () => ({
            id: uuidv4(),
            type: 'text',
            text: '',
        }),
    },
    titledList: {
        create: () => ({
            id: uuidv4(),
            type: 'titledList',
            title: '',
        }),
    },
    button: {
        create: () => ({
            id: uuidv4(),
            type: 'button',
        }),
    },
};
