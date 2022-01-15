import React, {
    memo,
    ReactElement,
    RefObject,
    useLayoutEffect,
    useRef,
} from 'react';
import { Mark, MarkedNode, MarkedText } from '../../model';
import { markText } from '../../model';
import { NodeView } from './NodeView';
import { NodeComponentAttrs } from '../types';
import { useView } from '../contexts/ViewContext';

const MarksWrapper = ({
    pos,
    node,
    onChange,
    value,
}: {
    pos: number;
    node: MarkedNode;
    value?: MarkedText;
    onChange: (text: MarkedText) => void;
}) => {
    const getUpdateMark =
        ({ from, to }: { from: number; to: number }) =>
        (mark: Mark) => {
            const updatedMarkedText = markText(value as MarkedText, {
                mark,
                range: [from, to],
            });
            onChange(updatedMarkedText);
        };
    const updateMarkRef = useRef(
        getUpdateMark({ from: pos, to: pos + node.text.length })
    );
    return <MarksFactory node={node} updateMarkRef={updateMarkRef} />;
};

const MarksFactory = memo(
    ({
        node,
        updateMarkRef,
    }: {
        node: MarkedNode;
        updateMarkRef: RefObject<(mark: Mark) => void>;
    }) => {
        const updateMark = (mark: Mark) => updateMarkRef.current?.(mark);
        return (
            <Marks marks={node.marks} node={node} updateMark={updateMark}>
                {node.text}
            </Marks>
        );
    },
    (prevProps, props) =>
        prevProps.node.text === props.node.text &&
        prevProps.node.type === props.node.type &&
        prevProps.node.marks?.length === props.node.marks?.length &&
        JSON.stringify(prevProps.node.marks) ===
            JSON.stringify(props.node.marks)
);

const Marks = ({
    node,
    marks,
    updateMark,
    children,
}: {
    node: MarkedNode;
    marks?: Mark[];
    updateMark: (mark: Mark) => void;
    children: ReactElement[] | ReactElement | string;
}) => {
    const view = useView();

    const mark = marks?.[0];
    if (mark) {
        const MarkComponent = view.marks[mark.type];
        if (!MarkComponent) return <>{children}</>;
        return (
            <MarkComponent node={node} updateMark={updateMark} mark={mark}>
                <Marks
                    node={node}
                    updateMark={updateMark}
                    marks={marks.slice(1)}
                >
                    {children}
                </Marks>
            </MarkComponent>
        );
    }

    const LeafMark = view.marks[
        node.type ?? ''
    ] as React.FC<NodeComponentAttrs>;
    if (!LeafMark) return <>{children}</>;

    if (node.type) {
        return (
            <NodeView view={view}>
                <LeafMark node={node} />
            </NodeView>
        );
    } else {
        return <>{children}</>;
    }
};

export const TextRenderer = React.memo(
    ({
        value,
        onChange,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        hashedKey,
        decorations = [],
        willRender = () => undefined,
        didRender = () => undefined,
    }: {
        stringText: string;
        value?: MarkedText;
        decorations?: any[];
        hashedKey: number;
        onChange: (text: MarkedText) => void;
        willRender: () => void;
        didRender?: () => void;
    }) => {
        willRender();
        useLayoutEffect(() => didRender());

        const decoratedText =
            value &&
            ((decorations ?? []).reduce((prev, curr) => {
                return markText(prev, { mark: curr.mark, range: curr.range });
            }, value) as MarkedText);

        let pos = 0;
        return (
            <>
                {decoratedText &&
                    decoratedText.map((markedNode, i) => {
                        const markPos = pos;
                        pos += markedNode.text.length;
                        return (
                            <MarksWrapper
                                key={i}
                                pos={markPos}
                                onChange={onChange}
                                value={value}
                                node={markedNode}
                            />
                        );
                    })}
            </>
        );
    },
    (prevProps, nextProps) => prevProps.hashedKey === nextProps.hashedKey
);
