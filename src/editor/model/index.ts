import { Editor as EditorClass } from './Editor';
import type { ResolvedState } from './StateResolver';
import type { Range } from './Selection';
import type {
    Node,
    Schema,
    MarkSchema,
    NodeSchema,
    MarkedText,
    Mark,
    MarkedNode,
} from './types';
import type { Editor, TransactionBuilder } from './Editor.interface';
import {
    TextSelection,
    BlockSelection,
    AbstractSelection,
    isTextSelection,
    isBlockSelection,
} from './Selection';
import { resolveState } from './StateResolver';
import { STATE_ERRORS } from './serializers/modelNormalizer';
import { cutMarkedText } from './MarkedText/cutMarkedText';
import { joinMarkedTexts } from './MarkedText/joinMarkedTexts';
import { getMarkedTextLength } from './MarkedText/getMarkedTextLength';
import { spliceText } from './MarkedText/spliceText';
import { splitMarkedText } from './MarkedText/splitMarkedText';
import { isCharNodeView } from './MarkedText/isCharNodeView';
import {
    markText,
    hasMark,
    unmarkText,
    insertNodeMark,
} from './MarkedText/markText';

export type {
    ResolvedState,
    MarkedText,
    Mark,
    MarkedNode,
    Node,
    Range,
    Schema,
    MarkSchema,
    NodeSchema,
    Editor,
    TransactionBuilder,
};

export {
    cutMarkedText,
    joinMarkedTexts,
    getMarkedTextLength,
    spliceText,
    splitMarkedText,
    isCharNodeView,
    markText,
    hasMark,
    unmarkText,
    insertNodeMark,
    AbstractSelection,
    TextSelection,
    BlockSelection,
    isTextSelection,
    isBlockSelection,
    resolveState,
    STATE_ERRORS,
};

export const createEditor = ({
    rootId,
    nodes,
    schema,
}: {
    rootId: string;
    nodes: Record<string, Node>;
    schema: Schema;
}) => new EditorClass({ rootId, nodes, schema }) as Editor;
