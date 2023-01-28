<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		currentConnectedPort,
		isConnectingState,
		secondaryConnectedPort,
		showIndices,
		showPositions,
	} from '../stores/global-config';
	import InfoText from './InfoText.svelte';
	import { ConnectionType, type Port } from './simulator';
	import { genTooltip, tooltip } from './tooltip';

	// Interface
	export let pos_x: number;
	export let pos_y: number;
	export let port_node: Port;
	export let show_labels = true;
	const port = port_node.getStore();
	// Attributes
	const label = port_node.port_name;
	let is_connecting = false;
	let is_secondary = false;
	let is_connected = false;
	// funny updates
	$: $port.x = pos_x;
	$: $port.y = pos_y;

	// Port label calculations
	const port_size = 8;
	const label_margin = 7;
	let label_offset: number;
	let text_anchor: string;
	switch ($port.type) {
		case ConnectionType.IN: {
			label_offset = label_margin;
			text_anchor = 'start';
			break;
		}
		case ConnectionType.OUT: {
			label_offset = -label_margin;
			text_anchor = 'end';
			break;
		}
	}

	// Event management
	const dispatch = createEventDispatcher();
	function handleMouseDown(e: MouseEvent) {
		console.debug('[Port] Was clicked');
		is_connecting = true;
		isConnectingState.set(true);
		currentConnectedPort.set(port_node);
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
			console.debug(`[Port] Selected ${port_node.port_name} as secondary`);
			is_secondary = true;
			secondaryConnectedPort.set(port_node);
		}
	}
	function handleMouseLeave(e: MouseEvent) {
		if (!is_connecting && $isConnectingState) {
			secondaryConnectedPort.set(null);
		}
		is_secondary = false;
	}
	// Remove secondary and primary modes
	$: {
		if (!$isConnectingState) {
			is_secondary = false;
			is_connecting = false;
		}
	}
	$: {
		if (port_node.type === ConnectionType.IN) {
			is_connected = $port.connections.length > 0;
		}
	}
</script>

<svelte:window on:mouseup={handleMouseUp} />

<g on:mousedown={handleMouseDown} on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
	<circle
		use:tooltip
		data-tooltip={genTooltip('Value: ' + $port.lastValue, 'Driver: ' + $port.isDriving())}
		id={port_node.port_name}
		class="{is_connected
			? 'fill-transparent'
			: is_connecting
			? 'fill-red-500/40'
			: 'fill-lime-600/40'} {is_secondary
			? 'hover:fill-blue-400'
			: is_connecting
			? 'hover:fill-red-500'
			: 'hover:fill-lime-600'} hover:stroke-black/40 transition-colors ease-in-out duration-100
    cursor-pointer"
		cx={pos_x}
		cy={pos_y}
		r={port_size}
	/>
</g>

{#if label !== null && show_labels}
	<text
		class="fill-gray-500"
		font-family="sans"
		text-anchor={text_anchor}
		dominant-baseline="middle"
		x={pos_x + label_offset}
		y={pos_y}
	>
		{label}
	</text>
{/if}

<InfoText
	bind:x={pos_x}
	x_offset={-2 * label_offset}
	text_anchor={$port.type === ConnectionType.IN ? 'end' : 'start'}
	bind:y={pos_y}
	bind:show={$showPositions}
>
	x: {Math.round($port.x)} y: {Math.round($port.y)}
</InfoText>

<InfoText
	bind:show={$showIndices}
	bind:x={pos_x}
	bind:y={pos_y}
    y_offset={20}
	classes={'fill-white stroke-black'}
>
	{$port.id}
</InfoText>
