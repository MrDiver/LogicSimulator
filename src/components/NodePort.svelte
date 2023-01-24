<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { currentConnectedPort, isConnectingState, secondaryConnectedPort, showPositions } from '../stores/global-config';
	import { PortType, type IPort } from './types';

	// Interface
	export let pos_x: number;
	export let pos_y: number;
	export let type: PortType = PortType.IN;
	export let connected = false;
	export let port_node: IPort;
	// Attributes
	const label = port_node.port_name;
	let is_connecting = false;
	let is_secondary = false;
	// funny updates
	$: port_node.pos_x = pos_x;
	$: port_node.pos_y = pos_y;

	// Port label calculations
	const port_size = 8;
	const label_margin = 7;
	let label_offset: number;
	let text_anchor: string;
	switch (type) {
		case PortType.IN: {
			label_offset = label_margin;
			text_anchor = 'start';
			break;
		}
		case PortType.OUT: {
			label_offset = -label_margin;
			text_anchor = 'end';
			break;
		}
	}

	//life hack for passing signals
	const port_store = writable(port_node);
	$: port_store.set(port_node);

	// Event management
	const dispatch = createEventDispatcher();
	function handleMouseDown(e: MouseEvent) {
		console.debug('[Port] Was clicked');
		is_connecting = true;
        isConnectingState.set(true);
        currentConnectedPort.set({source:port_node, store:port_store});
	}
	function handleMouseUp(e: MouseEvent) {
		console.debug('[Port] Connection was cancelled');
		if (is_connecting) {
			is_connecting = false;
			dispatch('cancel_port_connect', null);
            isConnectingState.set(false);
		}
	}
	function handleMouseEnter(e: MouseEvent) {
		if (!is_connecting && $isConnectingState) {
            console.debug(`[Port] Selected ${port_node.name} as secondary`)
			is_secondary = true;
            secondaryConnectedPort.set({source:port_node, store:port_store});
		}
	}
	function handleMouseLeave(e: MouseEvent) {
		if (!is_connecting && $isConnectingState) {
            secondaryConnectedPort.set(null);
		}
		is_secondary = false;
	}
    // Remove secondary and primary modes
    $:{
        if (!$isConnectingState){
            is_secondary = false;
            is_connecting = false;
        }
    }
    $: {
        if(type === PortType.IN){
            connected = $port_store.connections.length > 0
        }
    }
</script>

<svelte:window on:mouseup={handleMouseUp} />
<circle
	on:mousedown={handleMouseDown}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	id={port_node.port_name}
	class="{connected ? 'fill-transparent' : (is_connecting? 'fill-red-500/40' :'fill-lime-600/40')} {is_secondary
		? 'hover:fill-blue-400'
		: is_connecting
		? 'hover:fill-red-500'
		: 'hover:fill-lime-600'} hover:stroke-black/40 transition-colors ease-in-out duration-100"
	cx={pos_x}
	cy={pos_y}
	r={port_size}
/>

{#if label !== null}
	<text
		font-family="sans"
		text-anchor={text_anchor}
		dominant-baseline="middle"
		x={pos_x + label_offset}
		y={pos_y}>{label}</text
	>
{/if}

{#if $showPositions}
	<text
		transition:fade
		fill="red"
		font-family="sans"
		text-anchor={text_anchor}
		dominant-baseline="middle"
		x={pos_x - 20 * label_offset}
		y={pos_y}>x: {port_node.pos_x} y: {port_node.pos_y}</text
	>
{/if}
