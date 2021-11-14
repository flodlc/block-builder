import { Editor } from '../../model/Editor';
import React from 'react';

export type PluginFactory = (config?: any) => Plugin;

export type Plugin = ({
    editor,
    dom,
}: {
    editor: Editor;
    dom: HTMLElement;
}) => RegisteredPlugin;

export type RegisteredPlugin = {
    key: string;
    destroy?: () => void;
    Component?: React.FC<{ editor: Editor }>;
    addMarks?: () => Record<string, any>;
    addBlocks?: () => Record<string, any>;
};
