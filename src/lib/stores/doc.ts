import { writable } from 'svelte/store';

export type Doc = { id: string; title: string; content: string; path?: string } | null;
export const docStore = writable<Doc>(null);
