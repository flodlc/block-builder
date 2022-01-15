import { Node, Schema } from './types';
import { Editor as EditorClass } from './Editor';
import { Editor } from './Editor.interface';

export type { ResolvedState } from './StateResolver';
export type { MarkedText, Mark, MarkedNode, Node } from './types';
export type { Range } from './Selection';
export type { Schema, MarkSchema, NodeSchema } from './types';
export type { Editor, TransactionBuilder } from './Editor.interface';

export { cutMarkedText } from './MarkedText/cutMarkedText';
export { joinMarkedTexts } from './MarkedText/joinMarkedTexts';
export { getMarkedTextLength } from './MarkedText/getMarkedTextLength';
export { spliceText } from './MarkedText/spliceText';
export { splitMarkedText } from './MarkedText/splitMarkedText';
export { isCharNodeView } from './MarkedText/isCharNodeView';
export {
    markText,
    hasMark,
    unmarkText,
    insertNodeMark,
} from './MarkedText/markText';

export {
    TextSelection,
    BlockSelection,
    AbstractSelection,
    isTextSelection,
    isBlockSelection,
} from './Selection';

export { resolveState } from './StateResolver';
export { STATE_ERRORS } from './serializers/modelNormalizer';

export const createEditor = ({
    rootId,
    nodes,
    schema,
}: {
    rootId: string;
    nodes: Record<string, Node>;
    schema: Schema;
}) => new EditorClass({ rootId, nodes, schema }) as Editor;
