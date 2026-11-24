/**
 * GET /saved takes no parameters. The class exists so the validation pipe
 * (forbidNonWhitelisted) rejects any, e.g. `?userId=…`, with 400 instead of
 * silently ignoring an attempt to read someone else's Saved.
 */
export class ListSavedQuacksQueryDto {}
