import React from 'react';
import { Editor } from '../model/Editor';

export const EditorContext = React.createContext<Editor>(
    undefined as unknown as Editor
);
