const schema = [
    {
        type: 'p',
        parse: 'p',
        content: ['strong', 'text'],
    },
    {
        type: 'h2',
        parse: 'h2',
        content: ['strong', 'text'],
    },
    {
        type: 'h3',
        parse: 'h3',
        content: ['strong', 'text'],
    },
    {
        type: 'h1',
        parse: 'h1',
        content: ['strong', 'text'],
    },
    {
        type: 'strong',
        parse: 'strong',
        content: ['text'],
    },
];

const isText = (node: any) => {
    return node.matches('span, em, i, strong, ');
};

export const parse = (html: string) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const parsed = parseLayer(wrapper, {
        type: 'doc',
        content: ['p', 'h2', 'h1a'],
    });
    console.log(schema, wrapper, parsed);
};

const parseLayer = (
    domNode: Node,
    parentSchema: { type: string; content: string[] }
) => {
    // console.log(domNode);
    let result: any;
    if (domNode.nodeType === 1) {
        const childElement = domNode as HTMLElement;
        const nodeType = schema.find((schemaItem) =>
            childElement.matches(schemaItem.parse)
        );
        const childJson: any[] = Array.from(childElement.childNodes)
            .flatMap((child) => {
                return parseLayer(child, nodeType ?? parentSchema);
            })
            .filter((child) => child);

        if (nodeType) {
            result = {
                type: nodeType.type,
                children: childJson,
            };
        } else {
            result = childJson;
        }
    } else {
        result = {
            type: 'text',
            text: domNode.textContent,
        };
    }

    return result;
};

const validataSchema = (parentSchema: any, childSchema: any) => {
    // console.log(childSchema);
    const valableContent = parentSchema.content.includes(childSchema.type);
    const contentJsonWrapper =
        //schema.find((item) => item.content.includes(childSchema.type)) ??
        schema.find((item) => item.type === parentSchema.content[0]);
    // console.log(contentJsonWrapper, parentSchema, childSchema);
    return valableContent
        ? childSchema
        : { ...contentJsonWrapper, children: childSchema };
};
