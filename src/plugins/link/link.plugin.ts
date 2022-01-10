import { PluginFactory } from '../../editor/view/plugin/types';
import { Link } from './Link';

export const LinkPlugin: PluginFactory = () => () => {
    return {
        key: 'link',
        addMarks: () => ({
            link: Link,
        }),
    };
};
