import { Schema } from '../../editor/model/types';
import { textSchema } from './text.schema';
import { oliSchema } from './oli.schema';
import { calloutSchema } from './callout.schema';
import { cardSchema } from './card.schema';
import { dividerSchema } from './divider.schema';
import { quoteSchema } from './quote.schema';
import { uliSchema } from './uli.schema';
import { iSchema } from './i.schema';
import { bSchema } from './b.schema';
import { uSchema } from './u.schema';
import { mentionDecorationSchema, mentionSchema } from './mention.schema';
import { headingSchema } from './heading.schema';
import { linkSchema } from './link.schema';
import { imageSchema } from './image.schema';
import { toggleListSchema } from './toggleList.schema';

export const SCHEMA: Schema = {
    text: textSchema,
    heading: headingSchema,
    oli: oliSchema,
    uli: uliSchema,
    callout: calloutSchema,
    card: cardSchema,
    divider: dividerSchema,
    image: imageSchema,
    quote: quoteSchema,
    toggleList: toggleListSchema,
    i: iSchema,
    b: bSchema,
    u: uSchema,
    link: linkSchema,
    mention: mentionSchema,
    mentionDecoration: mentionDecorationSchema,
};
