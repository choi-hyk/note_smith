<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="flex h-screen w-screen flex-col overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100"
>
	<header
		class="flex h-12 shrink-0 items-center justify-between border-b border-gray-700 px-4 dark:border-gray-300"
	>
		<div class="font-semibold tracking-tight">Memo Smith</div>
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
