import { Editor } from '../../model';
import { View } from '../View';
import { RefObject, useLayoutEffect, useMemo } from 'react';
import { Plugin, PluginFactory } from '../plugin/types';
import { registerPlugins } from '../plugin/registerPlugins';
import { ArrowNavigationPlugin } from '../corePlugins/arrowNavigation/arrowNavigation.plugin';
import { HistoryShortcutsPlugin } from '../corePlugins/historyShortcuts/historyShortcuts.plugin';

const CORE_PLUGINS: PluginFactory[] = [
    ArrowNavigationPlugin,
    HistoryShortcutsPlugin,
];

export const useRegisterPlugins = (
    editor: Editor,
    plugins: Plugin[],
    domRef: RefObject<HTMLDivElement>,
    view?: View
) => {
    const registeredPlugins = useMemo(() => {
        return (
            view &&
            registerPlugins({
                editor,
                plugins: [
                    ...CORE_PLUGINS.map((plugin) => plugin()),
                    ...plugins,
                ],
                view,
                dom: domRef.current as HTMLDivElement,
            })
        );
    }, [view]);

    useLayoutEffect(() => {
        return () =>
            registeredPlugins?.forEach((registeredPlugin) =>
                registeredPlugin.destroy?.()
            );
    }, [view]);

    return registeredPlugins;
};
