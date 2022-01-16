import { State } from './types';
import { resolveState } from './StateResolver';

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

    abstract getNodeSelection(nodeId: string): unknown;
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

    isSame(selection?: AbstractSelection | TextSelection) {
        if (!isTextSelection(selection)) return false;
        return (
            this.nodeId === selection.nodeId &&
            TextSelection.areSameRange(this.range, selection.range)
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

export const isBlockSelection = (
    selection?: AbstractSelection | BlockSelection
): selection is BlockSelection => {
    return !!selection?.isBlock();
};

export const isTextSelection = (
    selection?: AbstractSelection | TextSelection
): selection is TextSelection => {
    return !!selection?.isText();
};
