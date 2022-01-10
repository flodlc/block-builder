import { State } from './types';
import { getMarkedTextLength } from '../transaction/MarkedText/getMarkedTextLength';
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

    getFirstLevelBlockIds(state: State) {
        const resolvedState = resolveState(state);
        const selected = new Map<string, string>();
        Array.from(this.nodeIds.values()).forEach((nodeId) => {
            const node = resolvedState.nodes[nodeId];
            if (node.parentId && selected.get(node.parentId)) return;
            selected.set(nodeId, nodeId);
        });
        return selected;
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
        return node.text?.reduce((prev, curr) => prev + curr.text, '') ?? '';
    }

    getTextBefore(state: State) {
        const text = this.getCurrentText(state);
        return text.slice(0, this.range[0]);
    }

    getTextLength(state: State) {
        const node = state.nodes[this.nodeId];
        return getMarkedTextLength(node.text ?? []);
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
