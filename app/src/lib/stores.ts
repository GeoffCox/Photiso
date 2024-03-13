import { writable } from "svelte/store";

export const recentDirectories = writable<string[]>([]);