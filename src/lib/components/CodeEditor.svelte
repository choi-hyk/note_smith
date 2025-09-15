<svelte:options runes={true} />

<script lang="ts">
	import loader from '@monaco-editor/loader';
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/theme';

	let { value = $bindable(''), language = 'markdown', readOnly = false } = $props();

	let container!: HTMLDivElement;
	let editor: import('monaco-editor').editor.IStandaloneCodeEditor | null = null;
	let monacoRef: typeof import('monaco-editor') | null = null;
	let applyingFromParent = false;
	let ro: ResizeObserver | null = null;
	let unsubTheme: (() => void) | null = null;

	onMount(async () => {
		const monaco = await loader.init();
		monacoRef = monaco;

		monaco.editor.defineTheme('light-theme', {
			base: 'vs',
			inherit: true,
			rules: [
				{ token: 'comment', foreground: '008000' },
				{ token: 'string', foreground: 'A31515' },
				{ token: 'keyword', foreground: '0000FF' },
				{ token: 'number', foreground: '098677' },
				{ token: 'type', foreground: '267F99' },
				{ token: 'variable', foreground: '000000' }
			],
			colors: {
				'editor.background': '#f1f5f9',
				'editor.foreground': '#000000',
				'editorLineNumber.foreground': '#858585'
			}
		});

		monaco.editor.defineTheme('dark-theme', {
			base: 'vs-dark',
			inherit: true,
			rules: [
				{ token: 'comment', foreground: '6A9955' },
				{ token: 'string', foreground: 'CE9178' },
				{ token: 'keyword', foreground: '569CD6' }
			],
			colors: {
				'editor.background': '#1e212e',
				'editor.foreground': '#d4d4d4'
			}
		});

		editor = monaco.editor.create(container, {
			value,
			language,
			readOnly,
			theme: $theme === 'dark' ? 'dark-theme' : 'light-theme',
			automaticLayout: true,
			minimap: { enabled: false },
			fontSize: 14
		});

		ro = new ResizeObserver(() => editor?.layout());
		ro.observe(container);

		editor.onDidChangeModelContent(() => {
			if (!editor || applyingFromParent) return;
			const v = editor.getValue();
			if (v !== value) value = v;
		});

		unsubTheme = theme.subscribe((mode) => {
			if (!monacoRef) return;
			monacoRef.editor.setTheme(mode === 'dark' ? 'dark-theme' : 'light-theme');
		});
	});

	onDestroy(() => {
		ro?.disconnect();
		unsubTheme?.();
		editor?.dispose();
		editor = null;
	});

	function setEditorValueSafely(next: string) {
		if (!editor || !monacoRef) return;
		const model = editor.getModel?.();
		if (!model) return;

		const cur = model.getValue();
		if (cur === next) return;

		applyingFromParent = true;

		const selection = editor.getSelection();
		editor.executeEdits('parent-inject', [{ range: model.getFullModelRange(), text: next }]);
		editor.pushUndoStop();
		if (selection) editor.setSelection(selection);

		applyingFromParent = false;
	}

	$effect(() => {
		setEditorValueSafely(value);
	});

	$effect(() => {
		if (!editor || !monacoRef) return;
		const model = editor.getModel?.();
		if (model) monacoRef.editor.setModelLanguage(model, language);
	});

	$effect(() => {
		if (editor) editor.updateOptions({ readOnly });
	});
</script>

<div bind:this={container} class="h-full min-h-[280px] w-full"></div>
