import { writable, type Writable } from "svelte/store";

export const showPositions: Writable<boolean> = writable(true);
export const zoomLevel: Writable<number> = writable(1.0);
