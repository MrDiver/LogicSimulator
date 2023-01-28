<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import {
		currentConnectedPort,
		isConnectingState,
		screenPosition,
		screenSize,
		secondaryConnectedPort,
		shouldSave,
		zoomLevel
	} from '../stores/global-config';
	import Inverter from './gates/Inverter.svelte';
	import Source from './gates/Source.svelte';
	import Sink from './gates/Sink.svelte';
	import GenericNode from './GenericNode.svelte';
	import * as LS from './simulator';
	import TmpWire from './TmpWire.svelte';
	import Wire from './Wire.svelte';
	import { onMount } from 'svelte';
	// let tmp = new LGB.MainTest();
	// tmp.crazy_func();
	// const tmp = new LS.TestMain();
	// tmp.main();
	let component_store: Writable<{ wires: LS.Wire[]; components: LS.Component[] }> = writable({
		wires: [],
		components: []
	});

	function prepareForSave(cs: { wires: LS.Wire[]; components: LS.Component[] }) {
		let new_wires: LS.WireDto[] = cs.wires.map((w) => {
			return { id: w.id, a_id: w.conA.id, b_id: w.conB.id };
		});
		let new_components = cs.components.map((c) => {
			const cDto: LS.ComponentDto = {
				x: c.x,
				y: c.y,
				id: c.id,
				type: c.constructor.name,
				in_pins: c.in_pins.map((p) => {
					return { id: p.id, val: p.lastValue };
				}),
				out_pins: c.out_pins.map((p) => {
					return { id: p.id, val: p.lastValue };
				})
			};
			return cDto;
		});
		const prepared = { wires: new_wires, components: new_components };
		return JSON.stringify(prepared);
	}

	function loadFromSave(saveString: string | null) {
		if (saveString === undefined) {
			return { wires: [], components: [] };
		}
		const cs: { wires: LS.WireDto[]; components: LS.ComponentDto[] } = JSON.parse(saveString);
		// console.log('LOAD', cs);
		let components: LS.Component[] = [];
		let wires: LS.Wire[] = [];
		let pass2ports: Map<number, LS.Connector> = new Map();
		cs.components.forEach((c) => {
			// Create Components
			let c_node: LS.Component;
			switch (c.type) {
				case 'Source': {
					c_node = new LS.Source();
					break;
				}
				case 'Inverter': {
					c_node = new LS.Inverter();
					break;
				}
				case 'Sink': {
					c_node = new LS.Sink();
					break;
				}
				default: {
					console.error('Node not found ' + c.type);
					return;
				}
			}
			// Transfer Values
			c_node.id = c.id;
			c_node.x = c.x;
			c_node.y = c.y;
			c.in_pins.forEach((p, i) => {
				c_node.in_pins[i].id = p.id;
				c_node.in_pins[i].lastValue = p.val;
				pass2ports.set(p.id, c_node.in_pins[i]);
			});
			c.out_pins.forEach((p, i) => {
				c_node.out_pins[i].id = p.id;
				c_node.out_pins[i].lastValue = p.val;
				pass2ports.set(p.id, c_node.out_pins[i]);
			});
			components.push(c_node);
		});
		// Connect wires
		cs.wires.forEach((w) => {
			const a_node = pass2ports.get(w.a_id);
			const b_node = pass2ports.get(w.b_id);
			if (a_node === undefined || b_node === undefined) return;
			const w_node = new LS.Wire(a_node, b_node);
			w_node.id = w.id;
			wires.push(w_node);
		});
		return { components, wires };
	}

	let done_loading = false;
	onMount(() => {
		const load_string = window.localStorage.getItem('component_store');
		console.log('LOAD STRING', load_string);
		const loaded_state = loadFromSave(load_string);
		console.log('LOADED STATE', loaded_state);
		component_store = writable(loaded_state);
		if ($component_store.components.length === 0) {
			let source1 = new LS.Source();
			let sink1 = new LS.Sink();
			let inv1 = new LS.Inverter();
			let inv2 = new LS.Inverter();
			$component_store.components.push(source1);
			$component_store.components.push(sink1);
			$component_store.components.push(inv1);
			$component_store.components.push(inv2);
		}
		done_loading = true;
	});

	$: {
		if (done_loading) {
			console.log('Saving');
			window.localStorage.setItem('component_store', prepareForSave($component_store));
		}
	}

	function onSaveButton() {
		window.localStorage.setItem('component_store', prepareForSave($component_store));
	}
    $:{
        if($shouldSave){
            onSaveButton();
            $shouldSave = false;
        }
    }

	let current_primary_port_store;
	function filterWires(wires: LS.Wire[]) {
		return [...wires.filter((w) => w.id !== -1)];
	}
	function handleCancelPortConnect(e: CustomEvent<null>) {
		// console.log($currentConnectedPort, $secondaryConnectedPort);
		if ($currentConnectedPort !== null && $secondaryConnectedPort !== null) {
			let w = new LS.Wire($currentConnectedPort, $secondaryConnectedPort);
			const _wires = [...filterWires($component_store.wires), w];
			$component_store.wires = _wires;
		} else {
			console.log('CANCEL CONNECTING');
		}
		console.log('WIRES', $component_store.wires);
		current_primary_port_store = null;
		currentConnectedPort.set(null);
		secondaryConnectedPort.set(null);
	}
</script>

{#each $component_store.wires as wire (wire.id)}
	<Wire
		on:updateWires={() => {
			$component_store.wires = filterWires($component_store.wires);
		}}
		wire_node={wire}
	/>
{/each}
{#each $component_store.components as c (c.id)}
	{#if c instanceof LS.Inverter}
		<Inverter on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={c} />
	{:else if c instanceof LS.Source}
		<Source on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={c} />
	{:else if c instanceof LS.Sink}
		<Sink on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={c} />
	{:else}
		<GenericNode on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={c} />
	{/if}
{/each}

<TmpWire />
