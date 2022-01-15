import { PluginFactory } from '../../indexed';
import { Link } from './Link';

export const LinkPlugin: PluginFactory = () => () => {
    return {
        key: 'link',
        addMarks: () => ({
            link: Link,
        }),
    };
};
