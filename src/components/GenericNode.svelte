<script lang="ts">
	import { onMount } from 'svelte';
	import NodeBase from './NodeBase.svelte';
	import NodePort from './NodePort.svelte';
	import type { Component } from './simulator';

	// Attributes
	export let abstract_node: Component;
	export let show_name = true;
	export let show_labels = true;
	const node = abstract_node.getStore();
	let in_ports = $node.in_pins.length;
	let out_ports = $node.out_pins.length;
	const port_margin = 25;

	export let width = 80;
	export let height = (Math.max(in_ports, out_ports) + 2) * port_margin;

	function calc_port(id: number, num_ports: number, dimension: number) {
		const port_spacing = (dimension + port_margin) / (num_ports + 1);
		return (id + 1) * port_spacing - port_margin / 2;
	}
</script>

<NodeBase bind:pos_x={$node.x} bind:pos_y={$node.y}>
	<slot>
		<rect class="fill-white stroke-black stroke-2" x="0" y="0" rx="10" ry="10" {width} {height} />
	</slot>

	{#if show_name}
		<text
			class="fill-gray-500"
			dominant-baseline="hanging"
			text-anchor="middle"
			x={width / 2}
			y={2}
		>
			{abstract_node.name}
		</text>
	{/if}
</NodeBase>
{#each $node.in_pins as port, i}
	<NodePort
		on:start_port_connect
		on:cancel_port_connect
		bind:port_node={port}
		bind:show_labels
		pos_x={$node.x + 0}
		pos_y={$node.y + calc_port(i, in_ports, height)}
	/>
{/each}
{#each $node.out_pins as port, i}
	<NodePort
		on:start_port_connect
		on:cancel_port_connect
		bind:port_node={port}
		bind:show_labels
		pos_x={$node.x + width}
		pos_y={$node.y + calc_port(i, out_ports, height)}
	/>
{/each}
