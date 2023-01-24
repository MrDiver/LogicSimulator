<script lang="ts">
	import { PortType, Wire, type ConnectionPoint } from './types';
	import { type Writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	export let wire_node: Wire;
	export let node_a: Writable<ConnectionPoint>;
	export let node_b: Writable<ConnectionPoint>;

	// Do fancy Hovering thing
	let is_hovering = false;

	// Update Positions
	const type_a: PortType = wire_node.a.port_type;
	const type_b: PortType = wire_node.b.port_type;
	let offset_a = 0;
	let offset_b = 0;
	function getOffset(node_type: PortType): number {
		if (node_type === PortType.IN) {
			return -100;
		} else if (node_type === PortType.OUT) {
			return 100;
		}
		return 0;
	}
	offset_a = getOffset(type_a);
	offset_b = getOffset(type_b);
</script>

<g on:mouseenter={(e) => (is_hovering = true)} on:mouseleave={(e) => (is_hovering = false)}>
	<path
		class="{is_hovering ? 'stroke-yellow-500/60' : 'stroke-transparent'}
    transition-colors"
		stroke-width="15"
		fill="transparent"
		d="M {$node_a.pos_x} {$node_a.pos_y}
    C {$node_a.pos_x + offset_a} {$node_a.pos_y}
      {$node_b.pos_x + offset_b} {$node_b.pos_y}
      {$node_b.pos_x} {$node_b.pos_y}"
	/>

	<path
		stroke="black"
		stroke-width="5"
		fill="transparent"
		d="M {$node_a.pos_x} {$node_a.pos_y}
    C {$node_a.pos_x + offset_a} {$node_a.pos_y}
      {$node_b.pos_x + offset_b} {$node_b.pos_y}
      {$node_b.pos_x} {$node_b.pos_y}"
	/>

</g>
