import React, { ReactElement, useContext } from 'react';
import { Mark, MarkedNode, MarkedText } from '../../model/types';
import { markText } from '../../transaction/MarkedText/markText';
import { ViewContext } from '../contexts/ViewContext';

const Marks = ({
    marks,
    text,
    updateMark,
    children,
}: {
    marks?: MarkedNode['m'];
    text: string;
    updateMark: (mark: Mark) => void;
    children: ReactElement[] | string;
}) => {
    const mark = marks?.[0];

    if (!mark) {
        return <>{children}</>;
    }

    const view = useContext(ViewContext);
    const MarkComponent = view.marks[mark.t];

    return mark && MarkComponent ? (
        <MarkComponent text={text} updateMark={updateMark} mark={mark}>
            <Marks text={text} updateMark={updateMark} marks={marks.slice(1)}>
                {children}
            </Marks>
        </MarkComponent>
    ) : (
        <>{children}</>
    );
};

export const TextRenderer = React.memo(
    ({
        text,
        onChange,
        hashedKey,
        decorations = [],
    }: {
        text?: MarkedText;
        decorations?: any[];
        hashedKey: string;
        onChange: (text: MarkedText) => void;
    }) => {
        const getUpdateMark =
            ({ from, to }: { from: number; to: number }) =>
            (mark: Mark) => {
                const updatedMarkedText = markText(text as MarkedText, {
                    mark,
                    range: [from, to],
                });
                onChange(updatedMarkedText);
            };

        const decoratedText =
            text &&
            ((decorations ?? []).reduce((prev, curr) => {
                return markText(prev, { mark: curr.mark, range: curr.range });
            }, text) as MarkedText);

        let pos = 0;
        return (
            <>
                {decoratedText &&
                    decoratedText.map((markedNode, i) => {
                        const updateMark = getUpdateMark({
                            from: pos,
                            to: pos + markedNode.s.length,
                        });
                        pos += markedNode.s.length;
                        return (
                            <Marks
                                text={markedNode.s}
                                updateMark={updateMark}
                                key={i}
                                marks={markedNode.m}
                            >
                                {markedNode.s}
                            </Marks>
                        );
                    })}
            </>
        );
    },
    (prevProps, nextProps) => prevProps.hashedKey === nextProps.hashedKey
);
