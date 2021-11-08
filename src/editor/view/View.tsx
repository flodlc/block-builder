import React, { useEffect } from 'react';
import { Editor } from '../model/Editor';
import { EditorContext } from './contexts/EditorContext';
import { Child } from './Children';
import { ViewContext } from './contexts/ViewContext';
import { ViewPlugin } from './types';
import { viewConfig } from './configConfig';

export const View = ({
    editor,
    viewPlugins = [],
}: {
    editor: Editor;
    viewPlugins?: ViewPlugin[];
}) => {
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

    viewPlugins.forEach((viewPlugin) => {
        viewConfig.inputRules.push(...(viewPlugin.addInputRules?.() ?? []));
        viewConfig.marks = { ...viewConfig.marks, ...viewPlugin.addMarks?.() };
        viewConfig.blocks = {
            ...viewConfig.blocks,
            ...viewPlugin.addBlocks?.(),
        };
    });

    const rootNode = editor.state.nodes[editor.state.rootId];
    return (
        <ViewContext.Provider value={viewConfig}>
            <EditorContext.Provider value={editor}>
                <div className="view">
                    {rootNode.childrenIds && (
                        <Child parentId={'undefined'} nodeId={rootNode.id} />
                    )}
                </div>
            </EditorContext.Provider>
        </ViewContext.Provider>
    );
};
