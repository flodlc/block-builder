import React, { useLayoutEffect, useRef, useState } from 'react';
import { Editor } from '../model/Editor';
import { EditorContext } from './contexts/EditorContext';
import { Child } from './Children';
import { ViewContext } from './contexts/ViewContext';
import { Plugin, RegisteredPlugin } from './plugin/types';
import { registerPlugins } from './plugin/registerPlugins';
import { View } from './View';

export const ReactView = ({
    editor,
    plugins = [],
}: {
    editor: Editor;
    plugins?: Plugin[];
}) => {
    const [view, setView] = useState<View | undefined>(undefined);

    const ref = useRef<HTMLDivElement>(null);

    const [registeredPlugins, setRegisteredPlugins] = useState<
        RegisteredPlugin[] | undefined
    >(undefined);

    useLayoutEffect(() => {
        if (!ref.current) return;
        const view = new View(editor, ref.current);
        const registeredPlugins = registerPlugins({
            editor,
            plugins,
            view,
            dom: ref.current,
        });
        setRegisteredPlugins(registeredPlugins);
        setView(view);
        return () =>
            registeredPlugins?.forEach((registeredPlugin) =>
                registeredPlugin.destroy?.()
            );
    }, []);

    const rootNode = editor.state.nodes[editor.state.rootId];
    return (
        <>
            <div className="view" ref={ref} style={{ outline: 'none' }}>
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
                {registeredPlugins
                    ?.filter((item) => item.Component)
                    ?.map(({ Component }, i) => {
                        Component = Component as React.FC;
                        return <Component key={i} editor={editor} />;
                    })}
            </div>
        </>
    );
};
