// src/lib/utils/fs.ts
type FS = typeof import('@tauri-apps/plugin-fs');
type Dialog = typeof import('@tauri-apps/plugin-dialog');

let fsMod: Promise<FS> | null = null;
let dialogMod: Promise<Dialog> | null = null;
const getFs = () => (fsMod ??= import('@tauri-apps/plugin-fs'));
const getDialog = () => (dialogMod ??= import('@tauri-apps/plugin-dialog'));

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

function basename(path: string) {
	const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
	return i === -1 ? path : path.slice(i + 1);
}

export type PickResult = { content: string; path: string } | null;

export async function pickAndReadText(): Promise<PickResult> {
	const { open } = await getDialog();
	const picked = await open({
		multiple: false,
		directory: false,
		filters: [
			{ name: 'Text/Markdown', extensions: TEXT_EXTS },
			{ name: 'Code', extensions: CODE_EXTS }
		]
	});
	if (!picked) return null;

	const path = Array.isArray(picked) ? picked[0] : picked;
	const { readTextFile } = await getFs();
	const content = await readTextFile(path);
	return { content, path };
}

export async function writeText(content: string, path?: string): Promise<string | null> {
	const { writeTextFile } = await getFs();

	if (!path) {
		const { save } = await getDialog();
		const selected = await save({
			defaultPath: 'note.txt',
			filters: [
				{ name: 'Text/Markdown', extensions: TEXT_EXTS },
				{ name: 'Code', extensions: CODE_EXTS }
			]
		});
		if (!selected) return null;
		path = selected;
	}

	await writeTextFile(path, content);
	return path;
}

export { basename };
