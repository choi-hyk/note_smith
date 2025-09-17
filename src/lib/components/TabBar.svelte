<svelte:options runes={true} />

<script lang="ts">
	import type { NoteTab } from '$lib/stores/editor';
	import { tabs, activeTab, setActive, closeFile, newNote } from '$lib/stores/editor';
	import { X, FileText, Plus } from 'lucide-svelte';

	let tabList = $state<NoteTab[]>([]);
	let active = $state<NoteTab | null>(null);

	function onClose(e: MouseEvent, id: string) {
		e.stopPropagation();
		closeFile(id);
	}

	// 탭과 활성 탭 구독
	$effect(() => {
		const u1 = tabs.subscribe((v) => (tabList = v));
		const u2 = activeTab.subscribe((v) => (active = v));
		return () => {
			u1();
			u2();
		};
	});
</script>

<div class="flex h-10 items-stretch border-b border-border bg-primary/50">
	<!-- 탭 목록 -->
	<nav class="flex flex-1 items-stretch overflow-x-auto">
		{#each tabList as t}
			<button
				class="group relative flex min-w-0 items-center gap-2 border-r border-border px-4 text-sm transition-colors hover:bg-accent/80 focus:ring-2 focus:ring-border focus:outline-none"
				class:bg-accent={active?.id === t.id}
				onclick={() => setActive(t.id)}
				title={t.path ?? t.title}
				aria-current={active?.id === t.id ? 'page' : undefined}
			>
				<span class="text-sm"><FileText class="h-3.5 w-3.5" /></span>
				<span class="max-w-40 truncate text-fg">{t.title}</span>

				{#if t.dirty}
					<span title="저장되지 않음" class="h-2 w-2 shrink-0 rounded-full bg-orange-500"></span>
				{:else}
					<span title="저장됨" class="h-2 w-2 shrink-0 rounded-full bg-green-500"></span>
				{/if}

				<div
					class="ml-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<!-- 탭 닫기 버튼 -->
					<span
						class="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm hover:bg-fg/20"
						onclick={(e) => onClose(e, t.id)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onClose(e as any, t.id);
							}
						}}
						role="button"
						tabindex="0"
						aria-label="close tab"
						title="close tab"
					>
						<X class="h-3 w-3" />
					</span>
				</div>
			</button>
		{/each}
	</nav>

	<!-- 새 노트 버튼 -->
	<button
		class="flex items-center gap-2 border-l border-border px-3 text-sm transition-colors hover:bg-accent/80 focus:ring-2 focus:ring-border focus:outline-none"
		onclick={() => newNote()}
		title="New Note"
		aria-label="New Note"
	>
		<Plus class="h-4 w-4 text-fg/70" />
		<span class="hidden text-fg/70 sm:inline">New Note</span>
	</button>
</div>
