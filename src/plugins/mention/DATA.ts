import { MentionValue } from './mention.types';

export const DATA: { label: string; value: () => MentionValue }[] = [
    {
        label: 'Today',
        value: () => ({ type: 'date', date: new Date().toISOString() }),
    },
    {
        label: 'Florian',
        value: () => ({ type: 'person', name: 'Florian' }),
    },
    {
        label: 'Clara',
        value: () => ({ type: 'person', name: 'Clara' }),
    },
    {
        label: 'Etienne',
        value: () => ({ type: 'person', name: 'Etienne' }),
    },
    {
        label: 'Suzanne',
        value: () => ({ type: 'person', name: 'Suzanne' }),
    },
    {
        label: 'John',
        value: () => ({ type: 'person', name: 'John' }),
    },
    {
        label: 'Mike',
        value: () => ({ type: 'person', name: 'Mike' }),
    },
    {
        label: 'Tyson',
        value: () => ({ type: 'person', name: 'Tyson' }),
    },
];
