import { Schema } from '../types';
import { Node } from './Node';

export const createNode = ({
    schema,
    type,
    node,
}: {
    schema: Schema;
    type: string;
    node?: Partial<Node>;
}): Node => {
    return new Node<any>({
        type,
        schema,
        ...node,
    });
};
