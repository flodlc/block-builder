import React, { useLayoutEffect, useState } from 'react';
import { Editor } from '../editor/model/Editor';
import { View } from '../editor/view/View';
import { BIG_DATA, PLAYGROUND_DATA } from './DATA';
import { MentionPlugin } from '../extensions/mention/mention.plugin';
import { BlockSelectionPlugin } from '../extensions/blockSelection/blockSelection.plugin';
import { SuggestionPlugin } from '../extensions/suggestion/suggestion.plugin';
import { HistoryShortcutsPlugin } from '../extensions/historyShortcuts/historyShortcuts.plugin';
import { CalloutPlugin } from '../extensions/callout/callout.plugin';
import { TextPlugin } from '../extensions/text/text.plugin';
import { BoldPlugin } from '../extensions/bold/bold.plugin';
import { toggleBold } from '../extensions/bold/toggleBold.command';
import { BlockSelectionShortcutsPlugin } from '../extensions/blockSelectionShortcuts/blockSelectionShortcuts.plugin';
import { ArrowNavigationPlugin } from '../extensions/arrowNavigation/arrowNavigation.plugin';
import { CopyPastePlugin } from '../extensions/copyPaste/copyPaste.plugin';

function Playground() {
    const [editor] = useState(
        new Editor({
            rootId: 'doc',
            nodes: PLAYGROUND_DATA,
        })
    );

    console.time('render');
    useLayoutEffect(() => {
        console.timeEnd('render');
    }, []);

    const log = {
        editor: () => console.log(editor),
        state: () => console.log(JSON.parse(JSON.stringify(editor.state))),
        json: () => console.log(JSON.parse(JSON.stringify(editor.getJson()))),
    };

    return (
        <div className="editor">
            <div className="header">
                <button onClick={log.editor}>Log editor</button>
                <button onClick={log.state}>Log state</button>
                <button onClick={log.json}>Log json tree</button>
                <button onClick={editor.back}>Undo</button>
                <button onClick={() => editor.runCommand(toggleBold())}>
                    Bold
                </button>
            </div>
            <View
                plugins={[
                    MentionPlugin(),
                    BlockSelectionPlugin(),
                    SuggestionPlugin(),
                    HistoryShortcutsPlugin(),
                    CalloutPlugin(),
                    TextPlugin(),
                    BoldPlugin(),
                    BlockSelectionShortcutsPlugin(),
                    ArrowNavigationPlugin(),
                    CopyPastePlugin(),
                ]}
                editor={editor}
            />
        </div>
    );
}

export default Playground;
