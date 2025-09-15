import { writable, derived, get } from 'svelte/store';
import { docStore, type Doc } from './doc';
import { writeText } from '$lib/utils/fs';

export type NoteTab = {
	id: string;
	title: string;
	path?: string;
	content: string;
	lastSavedContent: string;
	dirty: boolean; // content !== lastSavedContent
	savedAt?: number;
};

const _tabs = writable<NoteTab[]>([]);
const _activeId = writable<string | null>(null);

export const tabs = { subscribe: _tabs.subscribe };
export const activeTab = derived(
	[_tabs, _activeId],
	([$tabs, $activeId]) => $tabs.find((t) => t.id === $activeId) ?? null
);

// utils
function computeDirty(content: string, lastSaved: string) {
	return content !== lastSaved;
}

function basename(path: string) {
	const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
	return i === -1 ? path : path.slice(i + 1);
}

// 활성 탭의 편집기 내용을 탭에 커밋
function commitActiveBuffer() {
	const id = get(_activeId);
	if (!id) return;
	const doc = get(docStore);
	if (!doc || doc.id !== id) return console.warn('commitActiveBuffer: docStore out of sync');

	_tabs.update((list) =>
		list.map((t) =>
			t.id === id
				? { ...t, content: doc.content, dirty: t.lastSavedContent !== doc.content || t.dirty }
				: t
		)
	);
}

// 새 노트 만들기
export function newNote(title = `note.txt`) {
	const id = crypto.randomUUID();
	const initial = '';
	const tab: NoteTab = {
		id,
		title,
		content: initial,
		lastSavedContent: initial,
		dirty: false
	};
	_tabs.update((list) => [...list, tab]);
	_activeId.set(id);
	docStore.set({ id, title, content: initial });
}

// 파일 열기
export function openFile(args: { path?: string; title?: string; content: string }) {
	if (!args.path && !args.title) {
		newNote();
		return;
	}
	const id = crypto.randomUUID();
	const title = args.title ?? (args.path ? basename(args.path) : 'note.txt');

	const tab: NoteTab = {
		id,
		title,
		path: args.path,
		content: args.content,
		lastSavedContent: args.content,
		dirty: false
	};

	_tabs.update((list) => [...list, tab]);
	_activeId.set(id);
	docStore.set({ id, title, content: args.content });
}

// 탭 활성 전환
export async function setActive(id: string) {
	if (get(_activeId) && get(_activeId) !== id) commitActiveBuffer();
	const tab = get(_tabs).find((t) => t.id === id);
	console.log(tab);
	if (!tab) return;
	_activeId.set(id);
	docStore.set({ id: tab.id, title: tab.title, content: tab.content });
}

// 파일 닫기
export function closeFile(id: string) {
	const list = get(_tabs);
	const idx = list.findIndex((t) => t.id === id);
	if (idx === -1) return;

	const wasActive = get(_activeId) === id;
	const next = [...list.slice(0, idx), ...list.slice(idx + 1)];
	_tabs.set(next);

	if (next.length === 0) {
		ensureActiveTab();
		return;
	}
	if (wasActive) {
		const fallback = next[Math.max(0, idx - 1)];
		_activeId.set(fallback.id);
		docStore.set({ id: fallback.id, title: fallback.title, content: fallback.content });
	}
}

// docStore → 활성 탭 동기화 (내용/제목 변화 반영 + dirty 재계산)
export function startDocSync() {
	let last: Doc = null;
	return docStore.subscribe((doc) => {
		if (!doc) return;
		if (last && last.id === doc.id && last.content === doc.content && last.title === doc.title) {
			return;
		}
		last = doc;

		const activeId = get(_activeId);
		if (!activeId || doc.id !== activeId) return;

		_tabs.update((list) =>
			list.map((t) => {
				if (t.id !== activeId) return t;
				const nextDirty = computeDirty(doc.content, t.lastSavedContent);
				if (t.content === doc.content && t.title === doc.title && t.dirty === nextDirty) return t;
				return { ...t, title: doc.title, content: doc.content, dirty: nextDirty };
			})
		);
	});
}

// 활성 탭 → dosStore 동기화 (내용/제목/경로 변화 반영)
export function startTabSync() {
	const id = get(_activeId);
	if (!id) return;
	const tab = get(_tabs).find((t) => t.id === id);
	if (!tab) return;

	const updatedTab = get(_tabs).find((t) => t.id === id);
	if (!updatedTab) return;

	const doc = get(docStore);
	if (doc && doc.id === id) {
		const needUpdate =
			doc.title !== updatedTab.title ||
			doc.content !== updatedTab.content ||
			doc.path !== updatedTab.path;
		if (needUpdate) {
			docStore.set({
				...doc,
				path: updatedTab.path,
				title: updatedTab.title,
				content: updatedTab.content
			});
		}
	}
}

// 현재 활성 탭을 저장 (경로가 있으면 그 경로로, 없으면 다이얼로그/다운로드)
export async function saveActive(): Promise<void> {
	const id = get(_activeId);
	if (!id) return;
	const tab = get(_tabs).find((t) => t.id === id);
	if (!tab) return;

	const savedPath = await writeText(tab.content, tab.path);
	_tabs.update((list) =>
		list.map((t) =>
			t.id === id
				? {
						...t,
						path: savedPath ?? t.path,
						title: savedPath ? basename(savedPath) : t.title,
						lastSavedContent: t.content,
						dirty: false,
						savedAt: Date.now()
					}
				: t
		)
	);
	startTabSync();
}

// "다른 이름으로 저장" (새 경로로 저장)
export async function saveActiveToPath(path: string): Promise<void> {
	const id = get(_activeId);
	if (!id) return;
	const tab = get(_tabs).find((t) => t.id === id);
	if (!tab) return;

	const savedPath = await writeText(tab.content, path);
	_tabs.update((list) =>
		list.map((t) =>
			t.id === id
				? {
						...t,
						path: savedPath ?? path,
						lastSavedContent: t.content,
						dirty: false,
						savedAt: Date.now()
					}
				: t
		)
	);
	startTabSync();
}

// 활성 탭이 없으면 새 노트 하나 만들기
export function ensureActiveTab() {
	if (get(_tabs).length > 0) return;
	newNote();
}
