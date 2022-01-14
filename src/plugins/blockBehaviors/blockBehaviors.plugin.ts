import { onBackspace } from './onBackspace';
import { onEnter } from './onEnter';
import { onDelete } from './onDelete';
import { onBackTab, onTab } from './onTab';
import { PluginFactory } from '../..';

export const BlockBehaviorsPlugin: PluginFactory =
    () =>
    ({ editor, view }) => {
        const enterHandler = () => onEnter({ editor, view });
        const backspaceHandler = () => onBackspace({ editor, view });
        const onDeleteHandler = () => onDelete({ editor });
        const onTabHandler = () => onTab({ editor });
        const onBackTabHandler = () => onBackTab({ editor });

        view.eventManager.on({ type: 'Enter' }, enterHandler);
        view.eventManager.on({ type: 'Backspace' }, backspaceHandler);
        view.eventManager.on({ type: 'Delete' }, onDeleteHandler);
        view.eventManager.on({ type: 'Tab' }, onTabHandler);
        view.eventManager.on({ type: 'BackTab' }, onBackTabHandler);
        return {
            key: 'jumps',
            destroy: () => {
                view.eventManager.off({ type: 'Enter' }, enterHandler);
                view.eventManager.off({ type: 'Backspace' }, backspaceHandler);
                view.eventManager.off({ type: 'Delete' }, onDeleteHandler);
                view.eventManager.off({ type: 'Tab' }, onTabHandler);
                view.eventManager.off({ type: 'BackTab' }, onBackTabHandler);
            },
        };
    };
