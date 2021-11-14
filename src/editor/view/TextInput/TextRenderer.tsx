import React, { useContext } from 'react';
import { Mark, MarkedNode, MarkedText } from '../../model/types';
import { markText } from '../../transaction/MarkedText/markText';
import { ViewContext } from '../contexts/ViewContext';

const Marks = ({
    marks,
    updateMark,
    children,
}: {
    marks?: MarkedNode['m'];
    updateMark: (mark: Mark) => void;
    children: any;
}) => {
    const mark = marks?.[0];

    if (!mark) {
        return <>{children}</>;
    }

    const view = useContext(ViewContext);
    const MarkComponent = view.marks[mark.t];

    return mark && MarkComponent ? (
        <MarkComponent updateMark={updateMark} mark={mark}>
            <Marks updateMark={updateMark} marks={marks.slice(1)}>
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
    }: {
        text?: MarkedText;
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

        let pos = 0;
        return (
            <>
                {text &&
                    text.map((markedNode, i) => {
                        const updateMark = getUpdateMark({
                            from: pos,
                            to: pos + markedNode.s.length,
                        });
                        pos += markedNode.s.length;
                        return (
                            <Marks
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
