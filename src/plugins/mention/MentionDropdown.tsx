import { Editor } from '../../editor/model/Editor';
import React, { useEffect, useState } from 'react';
import { TextSelection } from '../../editor/model/Selection';
import { DATA } from './DATA';
import { insertMention } from './insertMention.command';
import { MENTION_EVENTS } from './mention.const';
import { MentionPluginState } from './mention.types';
import { Coords } from '../../editor/view/types';

export const MentionComponentWrapper = ({ editor }: { editor: Editor }) => {
    const [mentionState, setMentionState] =
        useState<MentionPluginState | void>();

    useEffect(() => {
        const onChange = (mentionState: MentionPluginState) =>
            setMentionState({ ...mentionState });

        editor.on(MENTION_EVENTS.changed, onChange);
        return () => editor.off(MENTION_EVENTS.changed, onChange);
    }, []);

    return <MentionComponent {...mentionState} editor={editor} />;
};

export const MentionComponent = ({
    searchText,
    triggeringExpression,
    startBoundingRect,
    editor,
    slashPosition,
    close,
}: {
    searchText?: string;
    triggeringExpression?: string;
    startBoundingRect?: Coords;
    editor: Editor;
    slashPosition?: number;
    close?: () => void;
}) => {
    const getSearchSelection = () => {
        if (searchText === undefined || slashPosition === undefined) return;
        const selection = editor.state.selection as TextSelection;
        return selection.setRange([
            slashPosition,
            slashPosition +
                (triggeringExpression?.length ?? 0) +
                searchText.length,
        ]);
    };
    const commands = DATA.map((item) => {
        return {
            label: item.label,
            callback: () =>
                editor.runCommand(
                    insertMention({
                        selection: getSearchSelection(),
                        data: item.value(),
                    })
                ),
        };
    });

    const filteredCommands = !searchText
        ? commands
        : commands.filter((command) =>
              command.label
                  .toLocaleLowerCase()
                  .includes(searchText.toLocaleLowerCase())
          );

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (searchText === undefined) return;
            if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                const newIndex = getNextIndex({
                    index,
                    delta: e.key === 'ArrowUp' ? -1 : 1,
                    length: filteredCommands.length,
                });
                setIndex(newIndex);
            }
            if (e.key === 'Enter') execCommand(e, index);
        };
        document.addEventListener('keydown', handler, { capture: true });
        return () =>
            document.removeEventListener('keydown', handler, { capture: true });
    }, [searchText, filteredCommands]);

    useEffect(() => setIndex(0), [searchText]);

    const execCommand = (e: Event, i: number) => {
        e.preventDefault();
        e.stopPropagation();
        close?.();
        filteredCommands[i]?.callback();
    };

    return (
        <>
            {searchText !== undefined && startBoundingRect ? (
                <div
                    style={{
                        overflow: 'auto',
                        background: 'white',
                        width: '250px',
                        height: '300px',
                        marginTop: 'calc(6px)',
                        backgroundColor: '#3f4447',
                        color: 'white',
                        boxShadow:
                            'rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px',
                        borderRadius: '3px',
                        top: `${
                            startBoundingRect.top + startBoundingRect.height
                        }px`,
                        left: `${startBoundingRect.left}px`,
                        position: 'absolute',
                    }}
                >
                    <div
                        style={{
                            opacity: 0.7,
                            padding: '8px 10px',
                            fontSize: '12px',
                        }}
                    >
                        Search: {searchText}
                    </div>
                    {filteredCommands.map((command, i) => (
                        <div
                            style={{
                                background: index === i ? '#53575a' : '',
                                padding: '5px 10px',
                                opacity: 0.9,
                            }}
                            key={i}
                            onMouseEnter={() => setIndex(i)}
                            onMouseDownCapture={(e) =>
                                execCommand(e.nativeEvent, i)
                            }
                        >
                            {command.label}
                        </div>
                    ))}
                </div>
            ) : (
                <></>
            )}
        </>
    );
};

const getNextIndex = ({
    index,
    delta,
    length,
}: {
    index: number;
    delta: number;
    length: number;
}) => {
    return (index + delta + length * 100) % (length || 1);
};
