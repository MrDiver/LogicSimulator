<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import {
		currentConnectedPort,
		isConnectingState,
		lm,
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
	// const tmp = new LS.TestMain();
	// tmp.main();
    function loadFromSave(load_string){
		console.debug('LOAD STRING', load_string);
        if(load_string !== null){
            $lm.fromDto(JSON.parse(load_string));
            $lm = $lm;
            // $lm.wires.forEach((v,k)=>{
            //     v.triggerUpdateSelf();
            // })
        }
    }

	let done_loading = false;
	onMount(() => {
		const load_string = window.localStorage.getItem('component_store');
        loadFromSave(load_string)
		// console.debug('LOADED STATE', loaded_state);
		// component_store = writable(loaded_state);
		if ($lm.components.size === 0) {
            $lm.createComponent(LS.Source);
            $lm.createComponent(LS.Source);
            $lm.createComponent(LS.Sink);
            $lm.createComponent(LS.Sink);
            $lm.createComponent(LS.Inverter);
            $lm.createComponent(LS.Inverter);
            $lm = $lm;
		}
		done_loading = true;
	});

	$: {
		if (done_loading) {
			onSaveButton();
		}
	}

	function onSaveButton() {
		console.info('[NodeManager] Saving');
        const save_string = JSON.stringify($lm.getDto(), function replacer(key, value){
            return (key === 'lm') ? undefined : value
        })
		window.localStorage.setItem('component_store', save_string);
	}
	$: {
		if ($shouldSave) {
			onSaveButton();
			$shouldSave = false;
		}
	}

	let current_primary_port_store;
	function handleCancelPortConnect(e: CustomEvent<null>) {
		// console.log($currentConnectedPort, $secondaryConnectedPort);
		if ($currentConnectedPort !== null && $secondaryConnectedPort !== null) {
			$lm.createWire($currentConnectedPort.id, $secondaryConnectedPort.id);
            $lm = $lm;
		} else {
			//console.log('CANCEL CONNECTING');
		}
		//console.log('WIRES', $component_store.wires);
		current_primary_port_store = null;
		currentConnectedPort.set(null);
		secondaryConnectedPort.set(null);
	}
    let wires: LS.Wire[];
    let components: LS.Component[];
    $: wires = [...$lm.wires.values()];
    $: components = [...$lm.components.values()];
</script>

{#each wires as wire (wire.id)}
	<Wire
		on:updateWires={() => {
            $lm.filterWires();
            $lm = $lm;
		}}
		wire_node={wire}
	/>
{/each}
{#each components as c (c.id)}
	<!--{#if c instanceof LS.Inverter}-->
	<!-- <Inverter on:cancel_port_connect={handleCancelPortConnect} abstract_node={c} /> -->
	{#if c instanceof LS.Source}
		<Source on:cancel_port_connect={handleCancelPortConnect} abstract_node={c} />
	{:else if c instanceof LS.Sink}
		<Sink on:cancel_port_connect={handleCancelPortConnect} abstract_node={c} />
	{:else}
		<GenericNode on:cancel_port_connect={handleCancelPortConnect} abstract_node={c} />
	{/if}
{/each}

<TmpWire />
