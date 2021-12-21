import { useContext, useEffect, useState } from 'react';
import { ViewContext } from '../../contexts/ViewContext';
import { Decoration } from '../../types';
import { Editor } from '../../../model/Editor';

export const useNodeDecorations = ({
    nodeId,
    editor,
}: {
    nodeId: string;
    editor: Editor;
}) => {
    const view = useContext(ViewContext);
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
