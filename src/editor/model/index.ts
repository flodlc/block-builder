import { Editor as EditorClass } from './Editor';
import type { ResolvedState } from './StateResolver';
import type { Range } from './Selection';
import type {
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
import { Node, JsonNode } from './Node/Node';

export type {
    ResolvedState,
    MarkedText,
    Mark,
    MarkedNode,
    Range,
    Schema,
    MarkSchema,
    NodeSchema,
    Editor,
    TransactionBuilder,
    JsonNode,
};

export {
    Node,
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
