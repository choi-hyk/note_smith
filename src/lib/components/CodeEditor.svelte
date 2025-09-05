<script lang="ts">
	import loader from '@monaco-editor/loader';
	import { onMount, onDestroy } from 'svelte';
	import { theme, applyTheme } from '$lib/stores/theme';

	export let value: string = 'Start typing here...';
	export let language: 'typescript' | 'javascript' | 'markdown' | 'json' = 'typescript';
	export let readOnly: boolean = false;

	let container!: HTMLDivElement;
	let editor: any = null;

	onMount(() => {
		(async () => {
			try {
				const monaco = await loader.init();
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
						'editor.background': '#ffffff',
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
						'editor.background': '#000000',
						'editor.foreground': '#d4d4d4'
					}
				});

				if (!container) return;

				editor = monaco.editor.create(container, {
					value,
					language,
					readOnly,
					theme: $theme === 'light' ? 'light-theme' : 'dark-theme',
					automaticLayout: true,
					minimap: { enabled: false },
					fontSize: 14
				});
				console.log('[Monaco] created');
			} catch (e) {
				console.error('[Monaco] init error: ', e);
			}
		})();

		return () => {
			editor?.dispose();
			editor = null;
		};
	});

	onDestroy(() => editor?.dispose());
</script>

<div bind:this={container} class="h-full w-full"></div>
