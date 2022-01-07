import React, {
    memo,
    ReactElement,
    RefObject,
    useContext,
    useLayoutEffect,
    useRef,
} from 'react';
import { Mark, MarkedText } from '../../model/types';
import { markText } from '../../transaction/MarkedText/markText';
import { ViewContext } from '../contexts/ViewContext';
import { CompiledSchema } from '../../model/schema';
import { NodeView } from './NodeView';

const MarksWrapper = ({
    pos,
    marks,
    text,
    onChange,
    value,
    schema,
}: {
    pos: number;
    marks?: Mark[];
    text: string;
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
        getUpdateMark({ from: pos, to: pos + text.length })
    );
    return (
        <MarksFactory
            text={text}
            marks={marks}
            updateMarkRef={updateMarkRef}
            schema={schema}
        />
    );
};

const MarksFactory = memo(
    ({
        marks,
        text,
        updateMarkRef,
        schema,
    }: {
        marks?: Mark[];
        text: string;
        updateMarkRef: RefObject<(mark: Mark) => void>;
        schema: CompiledSchema;
    }) => {
        const updateMark = (mark: Mark) => updateMarkRef.current?.(mark);
        return (
            <Marks
                text={text}
                marks={marks}
                updateMark={updateMark}
                schema={schema}
            >
                {text}
            </Marks>
        );
    },
    (prevProps, props) =>
        prevProps.text === props.text &&
        prevProps.marks?.length === props.marks?.length &&
        JSON.stringify(prevProps.marks) === JSON.stringify(props.marks)
);

const Marks = ({
    marks,
    text,
    updateMark,
    children,
    schema,
}: {
    marks?: Mark[];
    text: string;
    updateMark: (mark: Mark) => void;
    children: ReactElement[] | ReactElement | string;
    schema: CompiledSchema;
}) => {
    const mark = marks?.[0];
    if (!mark) return <>{children}</>;

    const view = useContext(ViewContext);
    const MarkComponent = view.marks[mark.t];
    if (!MarkComponent) return <>{children}</>;

    const isNodeView = !schema[mark.t].allowText;
    if (isNodeView) {
        return (
            <NodeView mark={mark} view={view}>
                <MarkComponent
                    text={text}
                    updateMark={updateMark}
                    mark={mark}
                />
            </NodeView>
        );
    }

    return (
        <MarkComponent text={text} updateMark={updateMark} mark={mark}>
            <Marks
                text={text}
                updateMark={updateMark}
                marks={marks.slice(1)}
                schema={schema}
            >
                {children}
            </Marks>
        </MarkComponent>
    );
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
                        pos += markedNode.s.length;
                        return (
                            <MarksWrapper
                                key={i}
                                pos={markPos}
                                onChange={onChange}
                                value={value}
                                text={markedNode.s}
                                marks={markedNode.m}
                                schema={schema}
                            />
                        );
                    })}
            </>
        );
    },
    (prevProps, nextProps) => prevProps.hashedKey === nextProps.hashedKey
);
