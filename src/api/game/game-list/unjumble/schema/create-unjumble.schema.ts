import z from 'zod';

import {
    fileSchema,
    StringToBooleanSchema,
    StringToObjectSchema,
} from '@/common';

export const UnjumbleSentenceSchema = z.object({
    sentence_text: z.string().max(2000).trim(),
    sentence_image_array_index: z.coerce.number().min(0).max(20).optional(),
});

export const CreateUnjumbleSchema = z.object({
    name: z.string().max(128).trim(),
    description: z.string().max(256).trim().optional(),
    thumbnail_image: fileSchema({}),
    is_publish_immediately: StringToBooleanSchema.default(false),
    is_randomized: StringToBooleanSchema.default(false),
    score_per_sentence: z.coerce.number().min(1).max(1000),
    files_to_upload: z.any().optional(),
    sentences: StringToObjectSchema(
        z.array(UnjumbleSentenceSchema).min(1).max(20),
    ),
});

export type ICreateUnjumble = z.infer<typeof CreateUnjumbleSchema>;
