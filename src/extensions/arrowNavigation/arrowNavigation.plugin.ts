import { PluginFactory } from '../../editor/view/plugin/types';
import { moveCarretUp } from './moveCarretUp';
import { moveCarretDown } from './moveCarretDown';

export const ArrowNavigationPlugin: PluginFactory =
    () =>
    ({ dom }) => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                moveCarretUp(e);
            }
            if (e.key === 'ArrowDown') {
                moveCarretDown(e);
            }
        };

        dom.addEventListener('keydown', onKeyDown);

        return {
            key: 'arrowPlugin',
        };
    };
