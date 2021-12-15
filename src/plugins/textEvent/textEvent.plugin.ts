import { PluginFactory } from '../../editor/view/plugin/types';
import { TextSelection } from '../../editor/model/Selection';

export const TextEventPlugin: PluginFactory =
    () =>
    ({ dom, editor }) => {
        const inputHandler = (e: Event) => {
            if (!editor.state.selection?.isText()) {
                throw 'Text input without selection';
            }
            const selection = editor.state.selection as TextSelection;
            editor.trigger(`input.${selection.nodeId}`, e);
        };

        const beforeInputHandler = (e: Event) => {
            if (!editor.state.selection?.isText()) {
                throw 'Text beforeinput without selection';
            }
            const selection = editor.state.selection as TextSelection;
            editor.trigger(`beforeinput.${selection.nodeId}`, e);
        };

        const keydownHandler = (e: Event) => {
            if (!editor.state.selection?.isText()) {
                throw 'Text keydown without selection';
            }
            const selection = editor.state.selection as TextSelection;
            editor.trigger(`keydown.${selection.nodeId}`, e);
        };

        const keydownCaptureHandler = (e: KeyboardEvent) => {
            if (e.isComposing) {
                // bug in chrome when composing: keydown is fired twice on enter.
                e.stopPropagation();
            }
        };

        const compositionStartHandler = (e: CompositionEvent) => {
            if (!editor.state.selection?.isText()) {
                throw 'Text compositionstart without selection';
            }
            const selection = editor.state.selection as TextSelection;
            editor.trigger(`compositionstart.${selection.nodeId}`, e);
        };

        const compositionEndHandler = (e: CompositionEvent) => {
            if (!editor.state.selection?.isText()) {
                throw 'Text compositionend without selection';
            }
            const selection = editor.state.selection as TextSelection;
            editor.trigger(`compositionend.${selection.nodeId}`, e);
        };

        dom.addEventListener('input', inputHandler);
        dom.addEventListener('beforeinput', beforeInputHandler);
        dom.addEventListener('keydown', keydownHandler);
        dom.addEventListener('keydown', keydownCaptureHandler, {
            capture: true,
        });
        dom.addEventListener('compositionstart', compositionStartHandler);
        dom.addEventListener('compositionend', compositionEndHandler);

        return {
            key: 'TextEventPlugin',
            destroy: () => {
                dom.removeEventListener('input', inputHandler);
                dom.removeEventListener('beforeinput', beforeInputHandler);
                dom.removeEventListener('keydown', keydownHandler);
                dom.removeEventListener('keydown', keydownCaptureHandler, {
                    capture: true,
                });
            },
        };
    };
