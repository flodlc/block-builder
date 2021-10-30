import React, { useEffect, useState } from 'react';
import { Editor } from '../model/Editor';
import { StateContext } from './StateContext';
import { EditorContext } from './EditorContext';
import { Children } from './Children';

export const View = ({ editor }: { editor: Editor }) => {
    const [state, setState] = useState(editor.state);
    const rootNode = state.nodes[state.rootId];

    useEffect(() => {
        const onChange = () => setState(editor.state);
        editor.on('change', onChange);
        return () => editor.off('change', onChange);
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'z' && e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                editor.back();
            }
        };
        document.addEventListener('keydown', onKeyDown, { capture: true });
        return () =>
            document.removeEventListener('keydown', onKeyDown, {
                capture: true,
            });
    }, []);

    return (
        <EditorContext.Provider value={editor}>
            <StateContext.Provider value={state}>
                <div className="view">
                    {rootNode.childrenIds && (
                        <Children
                            parentId={rootNode.id}
                            childrenIds={rootNode.childrenIds}
                        />
                    )}
                </div>
            </StateContext.Provider>
        </EditorContext.Provider>
    );
};
