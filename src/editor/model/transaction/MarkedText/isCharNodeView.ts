import { MarkedNode } from '../../types';

export const isCharNodeView = ({ char }: { char: MarkedNode }) => {
    return char.type;
};
