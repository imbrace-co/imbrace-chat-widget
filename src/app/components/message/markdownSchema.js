import { defaultSchema } from 'rehype-sanitize';

export const safeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        table: [...(defaultSchema.attributes?.table || []), ['className']],
        th: [...(defaultSchema.attributes?.th || []), ['align']],
        td: [...(defaultSchema.attributes?.td || []), ['align']],
        img: [['src', 'alt', 'title', 'width', 'height', 'loading']],
    },
};
