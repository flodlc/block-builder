import React, { useState } from 'react';
import { Editor } from '../editor/model/Editor';
import { ReactView } from '../editor/view/ReactView';
import { PLAYGROUND_DATA } from './DATA';
import { BlockSelectionPlugin } from '../plugins/blockSelection/blockSelection.plugin';
import { SuggestionPlugin } from '../plugins/suggestion/suggestion.plugin';
import { HistoryShortcutsPlugin } from '../plugins/historyShortcuts/historyShortcuts.plugin';
import { CalloutPlugin } from '../plugins/callout/callout.plugin';
import { TextPlugin } from '../plugins/text/text.plugin';
import { BoldPlugin } from '../plugins/bold/bold.plugin';
import { toggleBold } from '../plugins/bold/toggleBold.command';
import { BlockSelectionShortcutsPlugin } from '../plugins/blockSelectionShortcuts/blockSelectionShortcuts.plugin';
import { ArrowNavigationPlugin } from '../plugins/arrowNavigation/arrowNavigation.plugin';
import { CopyPastePlugin } from '../plugins/copyPaste/copyPaste.plugin';
import { MentionPlugin } from '../plugins/mention/mention.plugin';
import { JumpsPlugin } from '../plugins/jumps/jumps.plugin';
import { CardPlugin } from '../plugins/Card/card.plugin';
import { QuotePlugin } from '../plugins/quote/quote.plugin';
import { HeadingPlugin } from '../plugins/heading/heading.plugin';
import { SCHEMA } from './SCHEMA';
import { DividerPlugin } from '../plugins/divider/divider.plugin';

function Playground() {
    const [editor] = useState(
        new Editor({
            rootId: 'doc',
            nodes: PLAYGROUND_DATA,
            schema: SCHEMA,
        })
    );

    const log = {
        editor: () => console.log(editor),
        state: () => console.log(JSON.parse(JSON.stringify(editor.state))),
        json: () => console.log(JSON.parse(JSON.stringify(editor.getJson()))),
    };

    return (
        <div className="editor">
            <ReactView
                plugins={[
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
                <button onClick={log.editor}>Log editor</button>
                <button onClick={log.state}>Log state</button>
                <button onClick={log.json}>Log json tree</button>
                <button onClick={editor.back}>Undo</button>
                <button onClick={() => editor.runCommand(toggleBold())}>
                    Bold
                </button>
            </div>
        </div>
    );
}

export default Playground;
