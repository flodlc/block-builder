import { RefObject, useLayoutEffect, useState } from 'react';
import { View } from '../View';
import { useBindDom, useEventManager } from '../plugin/useEventManager';
import { Editor } from '../../model';

export const useCreateView = (
    editor: Editor,
    domRef: RefObject<HTMLDivElement>
) => {
    const eventManager = useEventManager();
    useBindDom(domRef, eventManager);

    const [view, setView] = useState<View | undefined>(undefined);
    useLayoutEffect(() => {
        if (!domRef.current) return;
        const view = new View(editor, domRef.current, eventManager);
        setView(view);
    }, []);
    return view;
};
