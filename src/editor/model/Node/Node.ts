import { MarkedText, Schema } from '../types';
import { getMarkedTextLength } from '../MarkedText/getMarkedTextLength';
import { v4 } from 'uuid';
import { cutMarkedText } from '../MarkedText/cutMarkedText';
import {
    hasMark,
    insertNodeMark,
    markText,
    unmarkText,
} from '../MarkedText/markText';
import { joinMarkedTexts } from '../MarkedText/joinMarkedTexts';
import { spliceText } from '../MarkedText/spliceText';
import { splitMarkedText } from '../MarkedText/splitMarkedText';
import { isCharNodeView } from '../MarkedText/isCharNodeView';

export type JsonNode<T extends Record<string, any> = any> = {
    id: string;
    type: string;
    text?: MarkedText;
    attrs?: T;
    childrenIds?: string[];
};

export class Node<T extends Record<string, any> = any> {
    constructor({
        id,
        type,
        text,
        attrs,
        childrenIds,
        schema,
    }: {
        id?: string;
        type: string;
        text?: MarkedText;
        attrs?: T;
        childrenIds?: string[];
        schema: Schema;
    }) {
        this.id = id ?? v4();
        this.type = type;
        this.text = text ?? [];
        this.attrs = attrs ?? ({} as T);
        this.childrenIds = childrenIds;
        this.schema = schema;
        this.validateAttributes();
        this.validateChildren();
    }

    patch(
        patch: Partial<Pick<Node, 'type' | 'text' | 'attrs' | 'childrenIds'>>
    ) {
        return new Node({
            id: this.id,
            type: this.type,
            text: this.text,
            attrs: this.attrs,
            childrenIds: this.childrenIds,
            schema: this.schema,
            ...patch,
        });
    }

    readonly id: string;
    readonly type: string;
    readonly text: MarkedText;
    readonly attrs: T;
    readonly childrenIds?: string[];

    get allowChildren() {
        return this.nodeSchema.allowChildren;
    }

    get allowText() {
        return this.nodeSchema.allowText;
    }

    getTextLength() {
        return getMarkedTextLength(this.text);
    }

    private get nodeSchema() {
        return this.schema[this.type];
    }

    private readonly schema: Schema;

    private validateChildren() {
        if (!this.nodeSchema.allowChildren && this.childrenIds?.length) {
            throw new Error('children not allowed');
        }
    }

    private validateAttributes() {
        Object.keys(this.nodeSchema.attrs ?? {}).forEach((attr) => {
            const attrSchema = this.nodeSchema.attrs[attr];
            if (this.attrs[attr] === undefined) {
                // @ts-ignore
                this.attrs[attr] = attrSchema.default;
            }
        });
    }

    static copyText = cutMarkedText;
    static joinMarkedTexts = joinMarkedTexts;
    static spliceText = spliceText;
    static splitMarkedText = splitMarkedText;
    static isCharNodeView = isCharNodeView;
    static markText = markText;
    static hasMark = hasMark;
    static unmarkText = unmarkText;
    static insertNodeMark = insertNodeMark;
}
