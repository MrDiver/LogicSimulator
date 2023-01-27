<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { ConnectionType, LogicValue, type Connector, type Wire } from './simulator';
	import { genTooltip, tooltip } from './tooltip';
	export let wire_node: Wire;
	const wire: Writable<Wire> = wire_node.getStore();
	const conA = $wire.conA.getStore();
	const conB = $wire.conB.getStore();
	// Do fancy Hovering thing
	let is_hovering = false;

	// Update Positions
	const type_a: ConnectionType = $conA.type;
	const type_b: ConnectionType = $conB.type;
	let offset_a = 0;
	let offset_b = 0;
	function getOffset(node_type: ConnectionType): number {
		if (node_type === ConnectionType.IN) {
			return -100;
		} else if (node_type === ConnectionType.OUT) {
			return 100;
		}
		return 0;
	}
	offset_a = getOffset(type_a);
	offset_b = getOffset(type_b);
	const port_margin = 50;
	function genPath(ax: number, ay: number, bx: number, by: number) {
		const is_reversed = ax < ax + offset_a && bx < ax;
		return `M ${ax} ${ay}
            C ${ax + offset_a} ${ay}
              ${bx + offset_b} ${by}
              ${bx} ${by}`;
	}
</script>

<g
	use:tooltip
	data-tooltip={genTooltip('Value: ' + $wire.viewValue())}
	on:mouseenter={(e) => (is_hovering = true)}
	on:mouseleave={(e) => (is_hovering = false)}
>
	<path
		class="{is_hovering ? 'stroke-yellow-500/60' : 'stroke-transparent'}
    transition-colors"
		stroke-width="15"
		fill="transparent"
		d={genPath($conA.x, $conA.y, $conB.x, $conB.y)}
	/>

	<path
        class:stroke-w_high={$wire.viewValue()===LogicValue.HIGH}
        class:stroke-w_low={$wire.viewValue()===LogicValue.LOW}
        class:stroke-w_x={$wire.viewValue()===LogicValue.X}
        class:stroke-w_z={$wire.viewValue()===LogicValue.Z}
        class:opacity-25={$wire.viewValue()===LogicValue.Z}
        class="fill-transparent stroke-[5] transition-colors"
		d={genPath($conA.x, $conA.y, $conB.x, $conB.y)}
	/>
</g>
