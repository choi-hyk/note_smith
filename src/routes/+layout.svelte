<svelte:options runes={true} />

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { docStore } from '$lib/stores/doc';
	import { Sun, Moon, FileUp } from 'lucide-svelte';
	import { pickAndReadText } from '$lib/utils/fs';
	import { theme, toggleTheme } from '$lib/stores/theme';

	let { children } = $props();

	async function openFromLayout() {
		const res = await pickAndReadText();
		if (!res) return;
		docStore.set({ content: res.content, path: res.path });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="flex h-screen w-screen flex-col overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100"
>
	<header
		class="flex h-12 shrink-0 items-center justify-start gap-5 border-b border-gray-700 px-4 dark:border-gray-300"
	>
		<button class="inline-flex items-center" onclick={openFromLayout}>
			<FileUp class="h-4 w-4" aria-hidden="true" />
			<span class="sr-only">파일 열기</span>
		</button>

		<button class="inline-flex items-center gap-1 rounded" onclick={toggleTheme}>
			{#if $theme === 'light'}
				<Sun class="h-4 w-4" aria-hidden="true" />
				<span class="sr-only">라이트</span>
			{:else}
				<Moon class="h-4 w-4" aria-hidden="true" />
				<span class="sr-only">다크</span>
			{/if}
		</button>
	</header>

	<main class="min-h-0 flex-1 overflow-hidden bg-white dark:bg-black">
		{@render children?.()}
	</main>

	<footer
		class="flex h-10 shrink-0 items-center justify-between border-t border-gray-700 px-4 text-xs text-gray-500 dark:border-gray-300 dark:text-gray-400"
	>
		<span>© {new Date().getFullYear()} memo_smith</span> <span>v0.0.1</span>
	</footer>
</div>
