import { writable, type Writable } from "svelte/store";
import { LM, type Connector } from "../components/simulator";

export const showPositions: Writable<boolean> = writable(false);
export const showIndices: Writable<boolean> = writable(false);
export const zoomLevel: Writable<number> = writable(1.0);
export const gridSpacing: Writable<number> = writable(45);
export const useGrid: Writable<boolean> = writable(true);
export const isConnectingState: Writable<boolean> = writable(false);
export const currentConnectedPort: Writable<Connector | null> = writable(null);
export const secondaryConnectedPort: Writable<Connector | null> = writable(null);
export const screenPosition: Writable<{ x: number, y: number }> = writable({ x: 0, y: 0 });
export const screenSize: Writable<{ x: number, y: number }> = writable({ x: 0, y: 0 });
export const mouseInsideLogic: Writable<{ x: number, y: number }> = writable({ x: 0, y: 0 });
export const shouldSave: Writable<boolean> = writable(false);
export let lm: Writable<LM> = writable(new LM());
