import React, { useLayoutEffect, useState } from 'react';
import { Editor } from '../editor/model/Editor';
import { View } from '../editor/view/View';
import { BIG_DATA, PLAYGROUND_DATA } from './DATA';
import { toggleItalic } from '../editor/model/commands/toggleItalic.command';
import { toggleBold } from '../editor/model/commands/toggleBold.command';
import { toggleUnderline } from '../editor/model/commands/toggleUnderline.command';
import { insertMention } from '../extensions/mention/insertMention.command';
import { mentionPlugin } from '../extensions/mention/mention.plugin';

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
                <button onClick={() => editor.runCommand(insertMention())}>
                    Mention
                </button>
                <button onClick={() => editor.runCommand(toggleBold())}>
                    Bold
                </button>
                <button onClick={() => editor.runCommand(toggleItalic())}>
                    italic
                </button>
                <button onClick={() => editor.runCommand(toggleUnderline())}>
                    underline
                </button>
            </div>
            <View viewPlugins={[mentionPlugin]} editor={editor} />
        </div>
    );
}

export default Playground;
