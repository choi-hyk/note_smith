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

	let lastDocId: string | null = null;
	let lastDocContent: string | null = null;

	$effect.pre(() => {
		const doc = $docStore;
		const nextContent = doc ? normalizeNewlines(doc.content) : '';

		const changed = (doc?.id ?? null) !== lastDocId || nextContent !== lastDocContent;

		if (changed) {
			textValue = nextContent;
			lastDocId = doc?.id ?? null;
			lastDocContent = nextContent;
		}
	});

	$effect(() => {
		const doc = $docStore;
		if (!doc) return;
		if (doc.content !== textValue) {
			docStore.set({ ...doc, content: textValue });
		}
	});
</script>

<section class="flex h-screen w-screen">
	<div class="w-1/2 border-r-2 border-border p-4">
		<CodeEditor bind:value={textValue} language="markdown" />
	</div>

	<article class="prose w-1/2 max-w-none overflow-y-auto p-4 dark:prose-invert">
		{@html renderedHtml}
	</article>
</section>
