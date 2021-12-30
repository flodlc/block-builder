import { Editor } from '../../model/Editor';
import React from 'react';
import { View } from '../View';
import { NodeSchema } from '../../model/types';

export type PluginFactory = (config?: any) => Plugin;

export type Plugin = ({
    editor,
    dom,
    view,
}: {
    editor: Editor;
    dom: HTMLElement;
    view: View;
}) => RegisteredPlugin;

export type RegisteredPlugin = {
    key: string;
    destroy?: () => void;
    Component?: React.FC<{ editor: Editor }>;
    addMarks?: () => Record<string, any>;
    addSchema?: () => Record<string, NodeSchema>;
    addBlocks?: () => Record<string, any>;
};
