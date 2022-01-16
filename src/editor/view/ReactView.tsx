import React, { useRef } from 'react';
import { Child } from './Children';
import { ViewContext } from './contexts/ViewContext';
import { Plugin } from './plugin/types';
import { Editor } from '../model';
import { EditorContext } from './contexts/EditorContext';
import { GLOBAL_EDITABLE } from './config';
import { useKeepScroll } from './hooks/useKeepScroll';
import { useCreateView } from './hooks/useCreateView';
import { useRegisterPlugins } from './hooks/useRegisterPlugins';

export const ReactView = ({
    editor,
    plugins = [],
    slot,
}: {
    editor: Editor;
    plugins?: Plugin[];
    slot: React.ReactElement;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const view = useCreateView(editor, ref);
    const registeredPlugins = useRegisterPlugins(editor, plugins, ref, view);
    useKeepScroll(editor);

    const rootNode = editor.getNode(editor.rootId);
    return (
        <div style={{ position: 'relative' }}>
            <div
                className="view"
                contentEditable={GLOBAL_EDITABLE}
                suppressContentEditableWarning={true}
                ref={ref}
                style={{ outline: 'none' }}
            >
                {view && (
                    <ViewContext.Provider value={view}>
                        <EditorContext.Provider value={editor}>
                            {rootNode && (
                                <Child
                                    parentId={'undefined'}
                                    nodeId={rootNode.id}
                                />
                            )}
                        </EditorContext.Provider>
                    </ViewContext.Provider>
                )}
            </div>
            {registeredPlugins
                ?.filter((item) => item.Component)
                ?.map(({ Component }, i) => {
                    Component = Component as React.FC;
                    return <Component key={i} editor={editor} />;
                })}
            {slot}
        </div>
    );
};
