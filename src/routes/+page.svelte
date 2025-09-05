<script lang="ts">
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { marked } from 'marked';
	let textValue: string = '';
	let renderedHtml: string | Promise<string>;

	$: renderedHtml = marked.parse(textValue);
</script>

<section class="flex h-full w-full flex-row">
	<div class="h-full w-3/5 border-r-2 border-gray-700 p-3 dark:border-gray-300">
		<CodeEditor bind:value={textValue} language="markdown" />
	</div>

	<div class="h-full w-2/5 overflow-y-auto p-4">
		{@html renderedHtml}
	</div>
</section>
