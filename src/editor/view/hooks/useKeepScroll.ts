import { useLayoutEffect } from 'react';
import { Editor } from '../../model';

export const useKeepScroll = (editor: Editor) => {
    useLayoutEffect(() => {
        const trHandler = () => {
            const val = document.scrollingElement?.scrollTop ?? 0;
            requestAnimationFrame(() => window.scroll(0, val));
        };
        editor.on('tr', trHandler);
        return () => {
            editor.off('tr', trHandler);
        };
    });
};
