import React, { useContext } from 'react';
import { Editor } from '../../model';

export const EditorContext = React.createContext<Editor>(
    undefined as unknown as Editor
);

export const useEditor = () => {
    return useContext(EditorContext);
};
