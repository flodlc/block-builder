import { PluginFactory, TextSelection } from '../../indexed';
import { BALLOON_EVENTS } from './balloon.const';
import { BalloonPluginState } from './balloon.types';

export const BalloonPlugin: PluginFactory =
    () =>
    ({ editor, view, dom }) => {
        let state: BalloonPluginState = {
            visible: false,
        };

        const trHandler = () => {
            const textSelection = editor.state.selection as TextSelection;
            const range = textSelection?.isText() && textSelection.range;
            if (!range || range[0] === range[1]) {
                hide();
                return;
            }
            state = editor.trigger(BALLOON_EVENTS.changed, {
                visible: true,
                startBoundingRect: view.getCoordsAtPos(
                    textSelection.nodeId,
                    textSelection.range[0]
                ),
            });
        };

        const hide = () => {
            if (!state.visible) return;
            state = editor.trigger(BALLOON_EVENTS.changed, {
                visible: false,
            });
        };

        const clickHandler = (e: MouseEvent) => {
            const textSelection = editor.state.selection as TextSelection;
            const range = textSelection?.isText() && textSelection.range;
            const target = e.target as HTMLElement;
            if (
                !range ||
                !dom.contains(e.target as Node) ||
                !target?.closest('.editable_content')
            )
                hide();
        };

        window.addEventListener('click', clickHandler);
        editor.on('tr', trHandler);
        return {
            key: 'balloon',
            destroy() {
                window.removeEventListener('click', clickHandler);
                editor.off('tr', trHandler);
            },
        };
    };
