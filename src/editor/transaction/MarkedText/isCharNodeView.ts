import { MarkedNode } from '../../model/types';

export const isCharNodeView = ({ char }: { char: MarkedNode }) => {
    return char.type;
};
