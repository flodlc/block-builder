import { PluginFactory } from '../../editor/view/plugin/types';
import React from 'react';
import { BlockComponentAttrs } from '../../editor/view/types';
import { Children } from '../../editor/view/Children';
import { SelectionHalo } from '../../editor/view/SelectionHalo';
import { TextInput } from '../../editor/view/TextInput/TextInput';
import { TextSelection } from '../../editor/model/Selection';

export const oliPlugin: PluginFactory = () => () => {
    return {
        key: 'oli',
        addBlocks() {
            return { oli: Oli };
        },
    };
};

const Oli: React.FC<BlockComponentAttrs> = ({
    node,
    blockSelected,
    selection,
}) => {
    const textSelection = selection as TextSelection;
    return (
        <div
            style={{
                padding: '2px',
                position: 'relative',
                paddingLeft: '20pxa',
            }}
            data-uid={node.id}
            className="oli"
        >
            <TextInput
                style={{ padding: '4px 0 4px 20px' }}
                nodeId={node.id}
                value={node.text}
                range={textSelection?.range}
                placeholder={<>Ordered List</>}
                keepPlaceholder={true}
            />
            <div
                style={{
                    paddingLeft: '24px',
                    marginTop: '2px',
                    marginBottom: '-2px',
                }}
            >
                <Children parentId={node.id} childrenIds={node.childrenIds} />
            </div>
            <SelectionHalo blockSelected={blockSelected} />
        </div>
    );
};
