<svelte:options runes={true} />

<script lang="ts">
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { marked } from 'marked';
	import { docStore } from '$lib/stores/doc';

	marked.setOptions({ gfm: true, breaks: true });

	let textValue = $state<string>('');
	let renderedHtml = $derived(marked.parse(textValue) as string);

	function normalizeNewlines(s: string) {
		return s.replace(/\r\n/g, '\n');
	}

	$effect(() => {
		const doc = $docStore;
		if (!doc) return;
		textValue = normalizeNewlines(doc.content);
		docStore.set(null);
	});
</script>

<section class="flex h-screen w-screen">
	<div class="flex flex-1 flex-col border-r p-4">
		<CodeEditor bind:value={textValue} language="markdown" />
	</div>

	<article class="prose max-w-none flex-1 overflow-y-auto p-4 dark:prose-invert">
		{@html renderedHtml}
	</article>
</section>
