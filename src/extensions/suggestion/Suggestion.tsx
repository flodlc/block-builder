import { Editor } from '../../editor/model/Editor';
import { insertMention } from '../mention/insertMention.command';
import React, { useEffect, useState } from 'react';
import { TextSelection } from '../../editor/model/Selection';
import { SUGGESTION_EVENTS, SuggestionPluginState } from './suggestion.plugin';

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
    searchText,
    startBoundingRect,
    editor,
    slashPosition,
}: {
    searchText?: string;
    startBoundingRect?: DOMRect;
    editor: Editor;
    slashPosition?: number;
}) => {
    const getSearchSelection = () => {
        if (searchText === undefined || slashPosition === undefined) return;
        const selection = editor.state.selection as TextSelection;
        return selection.setRange([
            slashPosition,
            slashPosition + 1 + searchText.length,
        ]);
    };
    const commands = [
        {
            label: 'Insert Mention',
            callback: () =>
                editor.runCommand(insertMention(getSearchSelection())),
        },
        {
            label: 'Insert Mention',
            callback: () =>
                editor.runCommand(insertMention(getSearchSelection())),
        },
    ];

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
                e.preventDefault();
                filteredCommands[index]?.callback();
            }
        };
        document.addEventListener('keydown', handler, { capture: true });
        return () =>
            document.removeEventListener('keydown', handler, { capture: true });
    }, [searchText, filteredCommands]);

    return (
        <>
            {searchText !== undefined && startBoundingRect ? (
                <div
                    style={{
                        background: 'white',
                        width: '250px',
                        height: '300px',
                        marginTop: 'calc(6px - 71px)',
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
                            }}
                            key={i}
                            onClick={command.callback}
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
