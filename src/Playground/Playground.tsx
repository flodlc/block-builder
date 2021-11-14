import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Editor } from '../editor/model/Editor';
import { View } from '../editor/view/View';
import { BIG_DATA, PLAYGROUND_DATA } from './DATA';
import { MentionPlugin } from '../plugins/mention/mention.plugin';
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
