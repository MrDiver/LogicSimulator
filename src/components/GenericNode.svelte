<script lang="ts">
	import NodeBase from './NodeBase.svelte';
	import NodePort from './NodePort.svelte';
	import { AbstractNode, PortType } from './types';

	// Attributes
	export let abstract_node: AbstractNode;
	let in_ports = abstract_node.in_ports.length;
	let out_ports = abstract_node.out_ports.length;
	const port_margin = 20;

	const width = 100;
	const height = (Math.max(in_ports, out_ports) + 2) * port_margin;

	function calc_port(id: number, num_ports: number, dimension: number) {
		const port_spacing = (dimension + port_margin) / (num_ports + 1);
		return (id + 1) * port_spacing - port_margin / 2;
	}
</script>

<NodeBase bind:pos_x={abstract_node.pos_x} bind:pos_y={abstract_node.pos_y}>
	<rect fill="white" stroke="black" stroke-width="2" x="0" y="0" rx="10" ry="10" {width} {height} />
	<text dominant-baseline="middle" text-anchor="middle" x={width / 2} y={height / 2}
		>{abstract_node.name}</text
	>
</NodeBase>
{#each abstract_node.in_ports as port}
	<NodePort
        on:start_port_connect
        on:cancel_port_connect
		bind:port_node={port}
		type={PortType.IN}
		pos_x={abstract_node.pos_x + 0}
		pos_y={abstract_node.pos_y + calc_port(port.port_id, in_ports, height)}
	/>
{/each}
{#each abstract_node.out_ports as port}
	<NodePort
        on:start_port_connect
        on:cancel_port_connect
		bind:port_node={port}
		type={PortType.OUT}
		pos_x={abstract_node.pos_x + width}
		pos_y={abstract_node.pos_y + calc_port(port.port_id, out_ports, height)}
	/>
{/each}
