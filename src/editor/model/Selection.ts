import { State } from './types';
import { getMarkedTextLength } from '../transaction/MarkedText/getMarkedTextLength';

export abstract class AbstractSelection {
    protected type?: 'text' | 'block';

    isText() {
        return this.type === 'text';
    }

    isBlock() {
        return this.type === 'block';
    }

    isSame(selection?: AbstractSelection) {
        return JSON.stringify(selection) === JSON.stringify(this);
    }

    abstract clone(): AbstractSelection;

    abstract getNodeSelection(nodeId: string): any;
}

export class BlockSelection extends AbstractSelection {
    readonly nodeIds: Map<string, string>;

    constructor(nodeIds: string[] | Map<string, string>) {
        super();
        this.type = 'block';
        if (Array.isArray(nodeIds)) {
            this.nodeIds = new Map<string, string>(
                nodeIds.map((nodeId) => [nodeId, nodeId])
            );
        } else {
            this.nodeIds = new Map<string, string>(nodeIds);
        }
    }

    getNodeSelection(nodeId: string) {
        return Boolean(this.nodeIds.get(nodeId));
    }

    addBlockToSelection(nodeId: string) {
        const newMap = new Map<string, string>(this.nodeIds);
        newMap.set(nodeId, nodeId);
        return new BlockSelection(newMap);
    }

    clone() {
        return new BlockSelection(this.nodeIds);
    }
}

export type Range = [number, number];

export class TextSelection extends AbstractSelection {
    readonly nodeId: string;
    readonly range: Range;

    constructor(nodeId: string, range: Range) {
        super();
        this.type = 'text';
        this.nodeId = nodeId;
        this.range = range;
    }

    getCurrentText(state: State) {
        const node = state.nodes[this.nodeId];
        return node.text?.reduce((prev, curr) => prev + curr.s, '') ?? '';
    }

    getTextBefore(state: State) {
        const text = this.getCurrentText(state);
        return text.slice(0, this.range[0]);
    }

    getTextLength(state: State) {
        const node = state.nodes[this.nodeId];
        return getMarkedTextLength(node.text ?? []);
    }

    isSame(selection?: AbstractSelection) {
        if (!selection?.isText()) return false;
        const s = selection as TextSelection;
        return (
            this.nodeId === s.nodeId &&
            TextSelection.areSameRange(this.range, s.range)
        );
    }

    getNodeSelection(nodeId: string) {
        return nodeId === this.nodeId ? this : undefined;
    }

    clone() {
        return new TextSelection(this.nodeId, [...this.range]);
    }

    setRange(range: Range) {
        return new TextSelection(this.nodeId, range && [...range]);
    }

    setCollapsedRange(position: number) {
        return new TextSelection(this.nodeId, [position, position]);
    }

    static areSameRange(rangeA?: Range, rangeB?: Range) {
        return (
            (rangeA?.[0] === rangeB?.[0] && rangeA?.[1] === rangeB?.[1]) ||
            (rangeA?.[0] === rangeB?.[1] && rangeA?.[1] === rangeB?.[0])
        );
    }
}
