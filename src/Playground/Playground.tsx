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
import { BlockSelectionShortcutsPlugin } from '../plugins/blockSelectionShortcuts/blockSelectionShortcuts.plugin';
import { ArrowNavigationPlugin } from '../editor/view/corePlugins/arrowNavigation/arrowNavigation.plugin';
import { CopyPastePlugin } from '../plugins/copyPaste/copyPaste.plugin';
import { MentionPlugin } from '../plugins/mention/mention.plugin';
import { BlockBehaviorsPlugin } from '../plugins/blockBehaviors/blockBehaviors.plugin';
import { CardPlugin } from '../plugins/Card/card.plugin';
import { QuotePlugin } from '../plugins/quote/quote.plugin';
import { HeadingPlugin } from '../plugins/heading/heading.plugin';
import { SCHEMA } from './SCHEMA';
import { DividerPlugin } from '../plugins/divider/divider.plugin';
import { Node } from '../editor/model/types';
import { ItalicPlugin } from '../plugins/italic/italic.plugin';
import { balloonPlugin } from '../plugins/balloon/balloon.plugin';
import { Balloon } from './Balloon';
import { createEditorApi } from './editorApi';
import { UnderlinePlugin } from '../plugins/underline/underline.plugin';
import { oliPlugin } from '../plugins/oli/oli.plugin';

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

    const editorApi = createEditorApi(editor);

    return (
        <div className="editor">
            <ReactView
                slot={
                    <>
                        <Balloon editorApi={editorApi} editor={editor} />
                    </>
                }
                plugins={[
                    BlockBehaviorsPlugin(),
                    MentionPlugin(),
                    BlockSelectionPlugin(),
                    SuggestionPlugin(),
                    HistoryShortcutsPlugin(),
                    CalloutPlugin(),
                    DividerPlugin(),
                    oliPlugin(),
                    QuotePlugin(),
                    CardPlugin(),
                    TextPlugin(),
                    HeadingPlugin(),
                    BoldPlugin(),
                    ItalicPlugin(),
                    UnderlinePlugin(),
                    BlockSelectionShortcutsPlugin(),
                    ArrowNavigationPlugin(),
                    CopyPastePlugin(),
                    balloonPlugin(),
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
                    <button onClick={() => editorApi.toggleBold()}>B</button>
                    <button onClick={() => editorApi.toggleItalic()}>I</button>
                </div>
            </div>
        </div>
    );
}

export default Playground;
