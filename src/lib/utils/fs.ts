import { invoke } from '@tauri-apps/api/core';

export const TEXT_EXTS = [
	'txt',
	'md',
	'markdown',
	'rst',
	'csv',
	'tsv',
	'log',
	'ini',
	'cfg',
	'conf',
	'env',
	'properties',
	'json',
	'jsonc',
	'toml',
	'yaml',
	'yml',
	'xml'
];

export const CODE_EXTS = [
	'js',
	'jsx',
	'cjs',
	'mjs',
	'ts',
	'tsx',
	'svelte',
	'vue',
	'py',
	'rb',
	'php',
	'pl',
	'pm',
	'sh',
	'bash',
	'zsh',
	'ps1',
	'psm1',
	'psd1',
	'c',
	'h',
	'hpp',
	'hh',
	'hxx',
	'cpp',
	'cc',
	'cxx',
	'ino',
	'm',
	'mm',
	'java',
	'kt',
	'kts',
	'scala',
	'go',
	'rs',
	'swift',
	'dart',
	'r',
	'jl',
	'lua',
	'hs',
	'clj',
	'cljs',
	'edn',
	'ex',
	'exs',
	'erl',
	'hrl',
	'nim',
	'zig',
	'sql'
];

export const ALL_TEXTLIKE_EXTS = Array.from(new Set([...TEXT_EXTS, ...CODE_EXTS]));

export function isTauri() {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

let cachedDialogOpen: null | ((opts?: any) => Promise<string | string[] | null>) | undefined;

async function getDialogOpen() {
	if (cachedDialogOpen !== undefined) return cachedDialogOpen;
	try {
		const mod = await import('@tauri-apps/plugin-dialog');
		cachedDialogOpen = mod.open;
	} catch {
		cachedDialogOpen = null;
	}
	return cachedDialogOpen;
}

function mapAcceptFromExts(exts: string[]) {
	return { 'text/plain': exts.map((e) => '.' + e) };
}

export async function pickAndReadText(): Promise<{ content: string; path?: string } | null> {
	const dialogOpen = await getDialogOpen();

	if (isTauri() && dialogOpen) {
		const picked = await dialogOpen({
			multiple: false,
			directory: false,
			filters: [
				{ name: 'Text/Markdown', extensions: TEXT_EXTS },
				{ name: 'Code', extensions: CODE_EXTS }
			]
		});
		if (!picked) return null;

		const path = Array.isArray(picked) ? picked[0] : picked;
		const content = await invoke<string>('read_file', { path });
		return { content, path };
	}

	if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
		// @ts-ignore
		const [fh] = await window.showOpenFilePicker({
			types: [{ description: 'Text-like', accept: mapAcceptFromExts(ALL_TEXTLIKE_EXTS) }],
			multiple: false
		});
		const file = await fh.getFile();
		return { content: await file.text(), path: file.name };
	}

	const input = document.createElement('input');
	input.type = 'file';
	input.accept = ALL_TEXTLIKE_EXTS.map((e) => '.' + e).join(',');
	const content = await new Promise<string | null>((resolve) => {
		input.onchange = async () => {
			const f = input.files?.[0];
			resolve(f ? await f.text() : null);
		};
		input.click();
	});
	if (content == null) return null;
	return { content };
}
