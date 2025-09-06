import { writable } from 'svelte/store';

export type Doc = { content: string; path?: string } | null;
export const docStore = writable<Doc>(null);
