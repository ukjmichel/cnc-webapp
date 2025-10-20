/**
 * Generic API envelope supporting both correct and typoed responses.
 */

export type ApiEnvelope<T> = { message: string } & { data: T };
