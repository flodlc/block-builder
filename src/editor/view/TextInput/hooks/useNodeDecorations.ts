import { Editor } from '../../../model/Editor';
import { useContext, useEffect, useState } from 'react';
import { ViewContext } from '../../contexts/ViewContext';
import { Decoration } from '../../types';

export const useNodeDecorations = ({
    editor,
    nodeId,
}: {
    editor: Editor;
    nodeId: string;
}) => {
    const view = useContext(ViewContext);
    const [decorations, setDecorations] = useState<Decoration[]>();

    useEffect(() => {
        const handler = () => setDecorations(view.decorations[nodeId]);
        editor.on('decorationsChanged', handler);
        return () => editor.off('decorationsChanged', handler);
    }, [decorations]);
    return decorations;
};
