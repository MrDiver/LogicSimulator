import { writable, type Writable } from "svelte/store";
import type { ConnectionPoint } from "../components/types";

type StoreAndValue = {
    store: Writable<ConnectionPoint>,
    source: ConnectionPoint
}

export const showPositions: Writable<boolean> = writable(true);
export const zoomLevel: Writable<number> = writable(1.0);
export const isConnectingState: Writable<boolean> = writable(false);
export const currentConnectedPort: Writable<StoreAndValue | null> = writable(null);
export const secondaryConnectedPort: Writable<StoreAndValue | null> = writable(null);
