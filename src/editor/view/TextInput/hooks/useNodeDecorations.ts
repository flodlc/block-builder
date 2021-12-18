import { useContext, useEffect, useState } from 'react';
import { ViewContext } from '../../contexts/ViewContext';
import { Decoration } from '../../types';

export const useNodeDecorations = ({ nodeId }: { nodeId: string }) => {
    const view = useContext(ViewContext);
    const [decorations, setDecorations] = useState<Decoration[]>();

    useEffect(() => {
        setDecorations(view.decorations[nodeId]);
    });
    return decorations;
};
