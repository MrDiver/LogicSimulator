import { writable, type Writable } from "svelte/store";

export const showPositions: Writable<boolean> = writable(true);