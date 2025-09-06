import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	const saved = localStorage.getItem('theme') as Theme | null;
	if (saved === 'light' || saved === 'dark') return saved;

	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

export const theme = writable<Theme>(getInitialTheme());

export function applyTheme(t: Theme) {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	if (t === 'dark') root.classList.add('dark');
	else root.classList.remove('dark');
	localStorage.setItem('theme', t);
	console.log(`Applied theme: ${t}`);
}

export function toggleTheme() {
	theme.update((curr) => {
		const next: Theme = curr === 'dark' ? 'light' : 'dark';
		applyTheme(next);
		return next;
	});
}
