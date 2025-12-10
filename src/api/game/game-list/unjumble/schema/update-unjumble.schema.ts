import z from 'zod';

import {
    fileSchema,
    StringToBooleanSchema,
    StringToObjectSchema,
} from '@/common';
import { UnjumbleSentenceSchema } from './create-unjumble.schema';

export const UpdateUnjumbleSchema = z.object({
    name: z.string().max(128).trim().optional(),
    description: z.string().max(256).trim().optional(),
    thumbnail_image: fileSchema({}).optional(),
    is_publish_immediately: StringToBooleanSchema.optional(),
    is_randomized: StringToBooleanSchema.optional(),
    score_per_sentence: z.coerce.number().min(1).max(1000).optional(),
    files_to_upload: z.any().optional(),
    sentences: StringToObjectSchema(
        z.array(UnjumbleSentenceSchema).min(1).max(20),
    ).optional(),
});

export type IUpdateUnjumble = z.infer<typeof UpdateUnjumbleSchema>;
