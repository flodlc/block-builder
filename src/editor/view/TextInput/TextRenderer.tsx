import React, {
    memo,
    ReactElement,
    RefObject,
    useContext,
    useLayoutEffect,
    useRef,
} from 'react';
import { Mark, MarkedNode, MarkedText } from '../../model/types';
import { markText } from '../../transaction/MarkedText/markText';
import { ViewContext } from '../contexts/ViewContext';
import { CompiledSchema } from '../../model/schema';
import { NodeView } from './NodeView';
import { NodeComponentAttrs } from '../types';

const MarksWrapper = ({
    pos,
    node,
    onChange,
    value,
    schema,
}: {
    pos: number;
    node: MarkedNode;
    value?: MarkedText;
    onChange: (text: MarkedText) => void;
    schema: CompiledSchema;
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
    return (
        <MarksFactory
            node={node}
            updateMarkRef={updateMarkRef}
            schema={schema}
        />
    );
};

const MarksFactory = memo(
    ({
        node,
        updateMarkRef,
        schema,
    }: {
        node: MarkedNode;
        updateMarkRef: RefObject<(mark: Mark) => void>;
        schema: CompiledSchema;
    }) => {
        const updateMark = (mark: Mark) => updateMarkRef.current?.(mark);
        return (
            <Marks
                marks={node.marks}
                node={node}
                updateMark={updateMark}
                schema={schema}
            >
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
    schema,
}: {
    node: MarkedNode;
    marks?: Mark[];
    updateMark: (mark: Mark) => void;
    children: ReactElement[] | ReactElement | string;
    schema: CompiledSchema;
}) => {
    const view = useContext(ViewContext);

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
                    schema={schema}
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
        schema,
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
        schema: CompiledSchema;
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
                                schema={schema}
                            />
                        );
                    })}
            </>
        );
    },
    (prevProps, nextProps) => prevProps.hashedKey === nextProps.hashedKey
);
