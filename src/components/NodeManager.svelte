<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import {
		currentConnectedPort,
		isConnectingState,
		secondaryConnectedPort
	} from '../stores/global-config';
	import GenericNode from './GenericNode.svelte';
	import Inverter from './Inverter.svelte';
	import * as LS from './simulator';
	import Source from './Source.svelte';
	import TmpWire from './TmpWire.svelte';
	import Wire from './Wire.svelte';
	// let tmp = new LGB.MainTest();
	// tmp.crazy_func();
	const tmp = new LS.TestMain();
	tmp.main();

	let wires: LS.Wire[] =[];
	let source1 = new LS.Source();
	let inv1 = new LS.Inverter();
	let inv2 = new LS.Inverter();

	let current_primary_port_store;
    function filterWires(wires: LS.Wire[]){
	    return [...wires.filter((w) => w.id !== -1)];
    }
	function handleCancelPortConnect(e: CustomEvent<null>) {
		// console.log($currentConnectedPort, $secondaryConnectedPort);
		if ($currentConnectedPort !== null && $secondaryConnectedPort !== null) {
			let w = new LS.Wire($currentConnectedPort, $secondaryConnectedPort);
			const _wires = [...filterWires(wires), w];
            wires = _wires;
		} else {
			console.log('CANCEL CONNECTING');
		}
		console.log('WIRES', wires);
		current_primary_port_store = null;
		currentConnectedPort.set(null);
		secondaryConnectedPort.set(null);
	}
</script>

{#each wires as wire (wire.id)}
	<Wire on:updateWires={()=> {wires=filterWires(wires)}} wire_node={wire} />
{/each}
<Inverter on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={inv1} />
<Inverter on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={inv2} />
<Source on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={source1} />
<TmpWire/>
