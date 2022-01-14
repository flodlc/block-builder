import { useEffect, useState } from 'react';
import { Decoration } from '../../types';
import { Editor } from '../../../model';
import { useView } from '../../contexts/ViewContext';

export const useNodeDecorations = ({
    nodeId,
    editor,
}: {
    nodeId: string;
    editor: Editor;
}) => {
    const view = useView();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setDecorations] = useState<Decoration[]>();

    useEffect(() => {
        const handler = () => setDecorations(view.decorations[nodeId]);
        editor.on('decorationsChanged', handler);
        return () => {
            editor.off('decorationsChanged', handler);
        };
    }, []);
    return view.decorations[nodeId];
};
