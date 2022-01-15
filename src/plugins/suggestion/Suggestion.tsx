import { Editor } from '../../indexed';
import React, { useEffect, useState } from 'react';
import { SuggestionPluginState } from './suggestion.types';
import { SUGGESTION_EVENTS } from './suggestion.const';
import { deleteLastChars } from '../commands/deleteLastChars';
import { getCommandList } from './commandList';
import { Coords } from '../../indexed';

export const SuggestionComponentWrapper = ({ editor }: { editor: Editor }) => {
    const [suggestionState, setSuggestionState] =
        useState<SuggestionPluginState | void>();

    useEffect(() => {
        const onChange = (suggestionState: SuggestionPluginState) =>
            setSuggestionState({ ...suggestionState });

        editor.on(SUGGESTION_EVENTS.changed, onChange);
        return () => editor.off(SUGGESTION_EVENTS.changed, onChange);
    }, []);

    return <SuggestionComponent {...suggestionState} editor={editor} />;
};

export const SuggestionComponent = ({
    close,
    searchText,
    startBoundingRect,
    editor,
}: {
    close?: () => void;
    searchText?: string;
    startBoundingRect?: Coords;
    editor: Editor;
    slashPosition?: number;
}) => {
    const commands = getCommandList({ editor });

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
                const newIndex =
                    ((e.key === 'ArrowUp' ? index - 1 : index + 1) +
                        filteredCommands.length * 100) %
                    (filteredCommands.length || 1);
                setIndex(newIndex);
            }

            if (e.key === 'Enter') {
                execCommmand(e, index);
            }
        };
        document.addEventListener('keydown', handler, { capture: true });
        return () =>
            document.removeEventListener('keydown', handler, { capture: true });
    }, [searchText, filteredCommands]);

    useEffect(() => setIndex(0), [searchText]);

    const execCommmand = (e: Event, i: number) => {
        e.preventDefault();
        e.stopPropagation();
        editor.runCommand(
            deleteLastChars({ numberChars: (searchText?.length ?? 0) + 1 })
        );
        close?.();
        filteredCommands[i]?.callback();
    };

    return (
        <>
            {searchText !== undefined && startBoundingRect ? (
                <div
                    style={{
                        background: 'white',
                        width: '250px',
                        height: '300px',
                        marginTop: '6px',
                        backgroundColor: '#3f4447',
                        color: 'white',
                        boxShadow:
                            'rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px',
                        borderRadius: '3px',
                        overflow: 'auto',
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
                            padding: '10px 15px',
                            fontSize: '12px',
                        }}
                    >
                        Search: {searchText}
                    </div>
                    {filteredCommands.map((command, i) => (
                        <div
                            style={{
                                background: index === i ? '#53575a' : '',
                                padding: '15px',
                                opacity: 0.9,
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                            key={i}
                            onMouseEnter={() => setIndex(i)}
                            onMouseDownCapture={(e) =>
                                execCommmand(e.nativeEvent, i)
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
