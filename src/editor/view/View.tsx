import React, { useLayoutEffect, useRef, useState } from 'react';
import { Editor } from '../model/Editor';
import { EditorContext } from './contexts/EditorContext';
import { Child } from './Children';
import { ViewContext } from './contexts/ViewContext';
import { defaultViewConfig } from './defaultViewConfig';
import { Plugin, RegisteredPlugin } from './plugin/types';
import { registerPlugins } from './plugin/registerPlugins';
import { ViewConfig } from './types';

export const View = ({
    editor,
    plugins = [],
}: {
    editor: Editor;
    plugins?: Plugin[];
}) => {
    const [viewConfig, setViewConfig] = useState<ViewConfig | undefined>(
        undefined
    );
    const ref = useRef<HTMLDivElement>(null);

    const [registeredPlugins, setRegisteredPlugins] = useState<
        RegisteredPlugin[] | undefined
    >(undefined);

    useLayoutEffect(() => {
        if (!ref.current) return;
        const viewConfig = defaultViewConfig;
        const registeredPlugins = registerPlugins({
            editor,
            viewConfig,
            plugins,
            dom: ref.current,
        });
        setRegisteredPlugins(registeredPlugins);
        setViewConfig(viewConfig);
        return () =>
            registeredPlugins?.forEach((registeredPlugin) =>
                registeredPlugin.destroy?.()
            );
    }, []);

    const rootNode = editor.state.nodes[editor.state.rootId];

    return (
        <div className="view" ref={ref}>
            {viewConfig && (
                <>
                    <ViewContext.Provider value={viewConfig}>
                        <EditorContext.Provider value={editor}>
                            {rootNode.childrenIds && (
                                <Child
                                    parentId={'undefined'}
                                    nodeId={rootNode.id}
                                />
                            )}
                        </EditorContext.Provider>
                    </ViewContext.Provider>

                    {registeredPlugins
                        ?.filter((item) => item.Component)
                        ?.map(({ Component }, i) => {
                            Component = Component as React.FC;
                            return <Component key={i} editor={editor} />;
                        })}
                </>
            )}
        </div>
    );
};
