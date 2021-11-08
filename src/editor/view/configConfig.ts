import { ViewConfig } from './types';
import { Bold, Italic, Underline } from './TextInput/marks/basicMarks';
import { Text } from '../../components/Text';
import { Callout } from '../../components/Callout';
import { Button } from '../../components/Button';
import { Toggle } from '../../components/Toggle';
import { Root } from './Root';

export const viewConfig: ViewConfig = {
    inputRules: [],
    marks: {
        b: Bold,
        i: Italic,
        u: Underline,
    },
    blocks: {
        text: Text,
        callout: Callout,
        button: Button,
        toggle: Toggle,
        doc: Root,
    },
};
