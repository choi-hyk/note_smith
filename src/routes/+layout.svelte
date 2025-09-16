<svelte:options runes={true} />

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Sun, Moon, Minus, Square, X } from 'lucide-svelte';
	import {
		activeTab,
		startDocSync,
		openFile,
		saveActive,
		ensureActiveTab
	} from '$lib/stores/editor';
	import { theme, toggleTheme } from '$lib/stores/theme';
	import { pickAndReadText } from '$lib/utils/fs';
	import TabBar from '$lib/components/TabBar.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let path: string = $derived($activeTab?.path ?? 'note.txt');
	let appWindow: ReturnType<typeof import('@tauri-apps/api/window').getCurrentWindow> | null = null;

	let stopSync: () => void;
	$effect(() => {
		stopSync = startDocSync();
		ensureActiveTab();
		return () => stopSync?.();
	});

	async function openFromLayout() {
		const res = await pickAndReadText();
		if (!res || !res.path) return;
		openFile({ path: res.path, content: res.content });
	}

	async function onSave() {
		await saveActive();
	}

	onMount(() => {
		(async () => {
			const { getCurrentWindow } = await import('@tauri-apps/api/window');
			appWindow = getCurrentWindow();
		})();
	});

	const minimize = () => appWindow?.minimize();
	const toggleMax = () => appWindow?.toggleMaximize();
	const closeWin = () => appWindow?.close();
	const startDrag = (e: MouseEvent) => {
		if (e.button !== 0) return;

		const el = e.target as HTMLElement;
		if (el.closest('button, activeTab, input, select, textarea, [data-no-drag]')) return;

		appWindow?.startDragging();
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen w-screen flex-col overflow-hidden bg-bg text-fg/80">
	<header
		role="none"
		onmousedown={startDrag}
		class="grid h-13 shrink-0 grid-cols-3 items-center border-b border-border bg-primary pl-6 shadow-sm"
	>
		<!-- 왼쪽 영역 -->
		<div class="flex items-center gap-4 justify-self-start">
			<h1 class="text-lg font-semibold text-fg">Note Smith</h1>

			<div class="flex items-center gap-3">
				<button
					class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-accent focus:ring-2 focus:ring-border focus:outline-none"
					onclick={openFromLayout}
					title="Open Note"
				>
					<span class="hidden sm:inline">Open Note</span>
				</button>
				<button
					class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-accent focus:ring-2 focus:ring-border focus:outline-none"
					onclick={onSave}
					title="Save"
				>
					<span class="hidden sm:inline">Save</span>
				</button>
			</div>
		</div>

		<!-- 가운데(정중앙) -->
		<div class="max-w-[50vw] justify-self-center truncate text-center text-xs font-medium">
			{path}
		</div>

		<!-- 오른쪽 영역 -->
		<div class="justify-self-end pr-2">
			<button
				class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus:ring-2 focus:ring-border focus:outline-none"
				onclick={toggleTheme}
				title="테마 전환"
			>
				{#if $theme === 'light'}
					<Sun class="h-4 w-4" />
					<span class="hidden sm:inline">Dark Theme</span>
				{:else}
					<Moon class="h-4 w-4" />
					<span class="hidden sm:inline">Light Theme</span>
				{/if}
			</button>
			<button
				id="titlebar-minimize"
				class="rounded p-3 hover:bg-accent"
				title="Minimize"
				onclick={minimize}
			>
				<Minus size={13} />
			</button>

			<button
				id="titlebar-maximize"
				class="rounded p-3 hover:bg-accent"
				title="Maximize"
				onclick={toggleMax}
			>
				<Square size={13} />
			</button>

			<button
				id="titlebar-close"
				class="rounded p-3 hover:bg-accent"
				title="Close"
				onclick={closeWin}
			>
				<X size={13} />
			</button>
		</div>
	</header>

	<TabBar />

	<main class="min-h-0 flex-1 overflow-hidden bg-bg">
		{@render children?.()}
	</main>

	<footer
		class="flex h-12 shrink-0 items-center justify-between border-t border-border bg-primary px-6 text-xs text-fg/70"
	>
		<div class="flex items-center gap-4">
			<span>© {new Date().getFullYear()} Note Smith</span>
			<span class="hidden sm:inline">•</span>
			<span class="hidden sm:inline">text editor</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="rounded bg-accent px-2 py-1 text-xs font-medium">v0.0.1</span>
		</div>
	</footer>
</div>
