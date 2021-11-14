import { PluginFactory } from '../../editor/view/plugin/types';
import { parse } from './htmlParser';

export const CopyPastePlugin: PluginFactory =
    () =>
    ({ dom }) => {
        const pasteHandler = (e: ClipboardEvent) => {
            e.preventDefault();
            const html = e.clipboardData?.getData?.('text/html');
            if (!html) return;
            parse(html);
        };
        dom.addEventListener('paste', pasteHandler);
        return {
            key: 'copyPaste',
            destroy() {
                dom.removeEventListener('paste', pasteHandler);
            },
        };
    };
