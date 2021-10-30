import React, { useLayoutEffect, useState } from 'react';
import { Editor } from '../editor/model/Editor';
import { View } from '../editor/view/View';
import { PLAYGROUND_DATA } from './DATA';

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
            </div>
            <View editor={editor} />
        </div>
    );
}

export default Playground;
