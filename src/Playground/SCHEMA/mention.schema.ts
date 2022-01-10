import { MarkSchema } from '../../editor/model/types';

export const mentionSchema: MarkSchema = {
    inline: true,
    attrs: {},
    allowText: false,
    allowChildren: false,
};

export const mentionDecorationSchema: MarkSchema = {
    inline: true,
    attrs: {},
    allowText: true,
    allowChildren: true,
};
