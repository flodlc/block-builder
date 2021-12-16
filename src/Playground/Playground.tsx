import React, { useEffect, useMemo, useState } from 'react';
import { Editor } from '../editor/model/Editor';
import { ReactView } from '../editor/view/ReactView';
import { BIG_DATA, PLAYGROUND_DATA } from './DATA';
import { BlockSelectionPlugin } from '../plugins/blockSelection/blockSelection.plugin';
import { SuggestionPlugin } from '../plugins/suggestion/suggestion.plugin';
import { HistoryShortcutsPlugin } from '../editor/view/corePlugins/historyShortcuts/historyShortcuts.plugin';
import { CalloutPlugin } from '../plugins/callout/callout.plugin';
import { TextPlugin } from '../plugins/text/text.plugin';
import { BoldPlugin } from '../plugins/bold/bold.plugin';
import { toggleBold } from '../plugins/bold/toggleBold.command';
import { BlockSelectionShortcutsPlugin } from '../plugins/blockSelectionShortcuts/blockSelectionShortcuts.plugin';
import { ArrowNavigationPlugin } from '../editor/view/corePlugins/arrowNavigation/arrowNavigation.plugin';
import { CopyPastePlugin } from '../plugins/copyPaste/copyPaste.plugin';
import { MentionPlugin } from '../plugins/mention/mention.plugin';
import { JumpsPlugin } from '../plugins/jumps/jumps.plugin';
import { CardPlugin } from '../plugins/Card/card.plugin';
import { QuotePlugin } from '../plugins/quote/quote.plugin';
import { HeadingPlugin } from '../plugins/heading/heading.plugin';
import { SCHEMA } from './SCHEMA';
import { DividerPlugin } from '../plugins/divider/divider.plugin';
import { Node } from '../editor/model/types';

function Playground() {
    const resetNote = (dataSet: Record<string, Node>) => () => {
        localStorage.clear();
        localStorage.setItem('nodes', JSON.stringify(dataSet));
        window.location.reload();
    };

    const data = useMemo(() => {
        const storedDataString = localStorage.getItem('nodes');
        return storedDataString
            ? JSON.parse(storedDataString)
            : PLAYGROUND_DATA;
    }, []);

    const [editor] = useState(
        new Editor({
            rootId: 'doc',
            nodes: data,
            schema: SCHEMA,
        })
    );

    useEffect(() => {
        editor.on('change', () => {
            localStorage.setItem('nodes', JSON.stringify(editor.state.nodes));
        });
    }, []);

    const log = {
        editor: () => console.log(editor),
        state: () => console.log(JSON.parse(JSON.stringify(editor.state))),
        json: () => console.log(JSON.parse(JSON.stringify(editor.getJson()))),
    };

    return (
        <div className="editor">
            <ReactView
                plugins={[
                    // TextEventPlugin(),
                    JumpsPlugin(),
                    MentionPlugin(),
                    BlockSelectionPlugin(),
                    SuggestionPlugin(),
                    HistoryShortcutsPlugin(),
                    CalloutPlugin(),
                    DividerPlugin(),
                    QuotePlugin(),
                    CardPlugin(),
                    TextPlugin(),
                    HeadingPlugin(),
                    BoldPlugin(),
                    BlockSelectionShortcutsPlugin(),
                    ArrowNavigationPlugin(),
                    CopyPastePlugin(),
                ]}
                editor={editor}
            />
            <div className="header">
                <div className="header_content">
                    <button onClick={log.editor}>Editor</button>
                    <button onClick={log.state}>State</button>
                    <button onClick={log.json}>Json</button>
                    <button onClick={resetNote(PLAYGROUND_DATA)}>Reset</button>
                    <button onClick={resetNote(BIG_DATA)}>Reset 2</button>
                    <button onClick={editor.back}>Undo</button>
                    <button onClick={() => editor.runCommand(toggleBold())}>
                        Bold
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Playground;
