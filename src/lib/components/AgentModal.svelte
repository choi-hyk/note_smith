<script lang="ts">
	import { X } from 'lucide-svelte';
	export let onClose: () => void = () => {};
</script>

<div
	class="shadow-l absolute right-3 bottom-15 z-40 flex h-1/2 w-[40%] flex-col rounded-[8px] border border-border"
>
	<!-- 헤더 -->
	<div class="flex items-center justify-between border-b border-border bg-primary/50 px-4 py-2">
		<div class="flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-9 w-9 fill-current">
				<rect x="5" y="8" width="14" height="10" rx="2" ry="2" />
				<circle cx="9" cy="13" r="1.5" class="fill-bg dark:fill-black" />
				<circle cx="15" cy="13" r="1.5" class="fill-bg dark:fill-black" />
				<line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" stroke-width="2" />
				<circle cx="12" cy="3" r="2" class="fill-current" />
			</svg>
			<h3 class="text-sm font-semibold">Note Agent</h3>
		</div>
		<button
			id="Note Agent close"
			class="rounded p-1 hover:bg-accent"
			title="Close"
			onclick={onClose}
		>
			<X size={13} />
		</button>
	</div>

	<!-- 채팅 영역 -->
	<div class="flex-1 overflow-y-auto bg-primary p-2 text-sm">
		<p class="text-gray-500"></p>
	</div>

	<!-- 입력 영역 -->
	<div class="border-t border-border bg-accent/40 p-4">
		<input
			type="text"
			placeholder=""
			class="w-full rounded-[20px] border border-border bg-border px-3 py-2 text-sm
         transition-colors duration-200 outline-none
         hover:border-accent focus:border-accent
         focus:ring-0 dark:text-white"
		/>
	</div>
</div>
