import { MarkedText, State } from './types';

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
    readonly field: string;
    readonly range: Range;

    constructor(nodeId: string, field: string, range: Range) {
        super();
        this.type = 'text';
        this.nodeId = nodeId;
        this.field = field;
        this.range = range;
    }

    getCurrentText(state: State) {
        const node = state.nodes[this.nodeId];
        return ((node as any)[this.field] as MarkedText)?.reduce(
            (prev, curr) => prev + curr.s,
            ''
        );
    }

    getTextBefore(state: State) {
        const text = this.getCurrentText(state);
        return text.slice(0, this.range[0]);
    }

    getNodeSelection(nodeId: string) {
        return nodeId === this.nodeId ? this : undefined;
    }

    clone() {
        return new TextSelection(this.nodeId, this.field, [...this.range]);
    }

    setRange(range: Range) {
        return new TextSelection(this.nodeId, this.field, [...range]);
    }

    setCollapsedRange(position: number) {
        return new TextSelection(this.nodeId, this.field, [position, position]);
    }
}
