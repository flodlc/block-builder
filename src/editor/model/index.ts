export type { MarkedText, Mark, MarkedNode, Node } from './types';
export type { Range } from './Selection';
export type { CompiledSchema } from './schema';
export type {
    Schema,
    MarkSchema,
    NodeSchema,
    CompiledNodeSchema,
    CompiledMarkSchema,
} from './types';

export { cutMarkedText } from './transaction/MarkedText/cutMarkedText';
export { joinMarkedTexts } from './transaction/MarkedText/joinMarkedTexts';
export { getMarkedTextLength } from './transaction/MarkedText/getMarkedTextLength';
export { spliceText } from './transaction/MarkedText/spliceText';
export { splitMarkedText } from './transaction/MarkedText/splitMarkedText';
export { isCharNodeView } from './transaction/MarkedText/isCharNodeView';
export {
    markText,
    hasMark,
    unmarkText,
    insertNodeMark,
} from './transaction/MarkedText/markText';

export {
    TextSelection,
    BlockSelection,
    AbstractSelection,
    isTextSelection,
    isBlockSelection,
} from './Selection';

export { serializeNode } from './serializers/htmlSerializer';
export { parseHtml } from './serializers/htmlParser';

export { isNodeSchema, isMarkSchema } from './types';
export { Editor } from './Editor';
export { useEditor, EditorContext } from '../view/contexts/EditorContext';
export { TransactionBuilder } from './transaction/TransactionBuilder';
export { resolveState } from './StateResolver';
export { STATE_ERRORS } from './serializers/modelNormalizer';
