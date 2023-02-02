<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { lm, showIndices } from '$lib/shared/stores/global-config';
	import InfoText from './InfoText.svelte';
	import NodeBase from './NodeBase.svelte';
	import NodePort from './NodePort.svelte';
	import type { Component } from '$lib/simulator';

	// Attributes
	export let abstract_node: Component;
	const node = abstract_node.getStore();
	let in_ports = $node.in_pins.length;
	let out_ports = $node.out_pins.length;
	const port_margin = 26;

	export let show_name = abstract_node.showNames;
	export let show_labels = abstract_node.showLabels;

	const hasAppearance = $node.appearance !== '';
	export let width = $node.width;
	export let height = hasAppearance
		? $node.height
		: (Math.max(in_ports, out_ports) + 2) * port_margin;
	export let viewHeight = $node.viewHeight;
	export let viewWidth = $node.viewWidth;

	function calc_port(id: number, num_ports: number, dimension: number) {
		const port_spacing = (dimension + port_margin) / (num_ports + 1);
		return (id + 1) * port_spacing - port_margin / 2;
	}
	let position = { x: abstract_node.x, y: abstract_node.y };
	$: {
		abstract_node.x = position.x;
		abstract_node.y = position.y;
	}
</script>

<NodeBase
	init_x={abstract_node.x}
	init_y={abstract_node.y}
	{width}
	{height}
	{viewHeight}
	{viewWidth}
	bind:position
>
	<slot>
		{#if $node.appearance != ''}
			<g style="transform:translate({-width / 2}px, {-height / 2}px)">
				{@html $node.appearance}
			</g>
		{:else}
			<rect
				class="fill-white stroke-black stroke-2"
				x={-viewWidth / 2}
				y={-viewHeight / 2}
				rx="10"
				ry="10"
				{width}
				{height}
			/>
		{/if}
	</slot>

	{#if show_name}
		<text
			class="fill-gray-500"
			dominant-baseline="hanging"
			text-anchor="middle"
			x={0}
			y={2 - height / 2}
		>
			{abstract_node.name}
		</text>
	{/if}
</NodeBase>
{#each $node.in_pins as port, i}
	<NodePort
		on:start_port_connect
		on:cancel_port_connect
		port_node={$lm.getInPort(port)}
		bind:show_labels
		pos_x={position.x - width / 2}
		pos_y={position.y + calc_port(i, in_ports, height) - height / 2}
	/>
{/each}
{#each $node.out_pins as port, i}
	<NodePort
		on:start_port_connect
		on:cancel_port_connect
		port_node={$lm.getOutPort(port)}
		bind:show_labels
		pos_x={position.x + width / 2}
		pos_y={position.y + calc_port(i, out_ports, height) - height / 2}
	/>
{/each}

<InfoText
	bind:show={$showIndices}
	x={position.x}
	y={position.y + height / 2}
	y_offset={0}
	text_baseline={'hanging'}
	classes={'fill-white stroke-black'}
>
	{$node.id}
</InfoText>
