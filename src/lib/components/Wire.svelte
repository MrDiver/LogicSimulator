<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { lm, showIndices, zoomLevel } from '$lib/shared/stores/global-config';
	import InfoText from './InfoText.svelte';
	import { ConnectionType, LogicValue, type Connector, type Wire } from '$lib/simulator';
	import { genTooltip, tooltip } from './tooltip';
	export let wire_node: Wire;
	const wire: Writable<Wire> = wire_node.getStore();
	const conA = $lm.getConnector($wire.conA).getStore();
	const conB = $lm.getConnector($wire.conB).getStore();
	// Do fancy Hovering thing
	let is_hovering = false;

	// Update Positions
	const type_a: ConnectionType = $conA.type;
	const type_b: ConnectionType = $conB.type;
	let offset_a = 0;
	let offset_b = 0;
	function getDistance() {
		const ax = $conA.x;
		const ay = $conA.y;
		const bx = $conB.x;
		const by = $conB.y;
		const dx = bx - ax;
		const dy = by - ay;
		//return Math.min(Math.sqrt(dx * dx + dy * dy), 400);
        return Math.max(Math.abs(dx),10);
	}
	function getOffset(node_type: ConnectionType): number {
		if (node_type === ConnectionType.IN) {
			return -getDistance();
		} else if (node_type === ConnectionType.OUT) {
			return getDistance();
		}
		return 0;
	}
	function genPath(ax: number, ay: number, bx: number, by: number) {
		offset_a = getOffset(type_a);
		offset_b = getOffset(type_b);
		return `M ${ax} ${ay}
            C ${ax + offset_a} ${ay}
              ${bx + offset_b} ${by}
              ${bx} ${by}`;
	}
    const dispatch = createEventDispatcher();
</script>

<!-- use:tooltip -->
<!-- data-tooltip={genTooltip(
    'Value: ' + $wire.viewValue(),
    'A: ' + $wire.conA.id,
    'B: ' + $wire.conB.id
 )}-->
<g
	on:mouseenter={(e) => (is_hovering = true)}
	on:mouseleave={(e) => (is_hovering = false)}
    on:mousedown={e => {$wire.disconnectAll(); dispatch('updateWires',{})}}
>
    <title>{$wire.lastValue}</title>
	<path
		class="{is_hovering ? 'stroke-yellow-500/60' : 'stroke-transparent'}
    transition-colors"
		stroke-width={Math.max(10 * $zoomLevel, 15)}
        stroke-linecap="round"
		fill="transparent"
		d={genPath($conA.x, $conA.y, $conB.x, $conB.y)}
	/>

	<path
		class:stroke-w_high={$wire.lastValue === LogicValue.HIGH}
		class:stroke-w_low={$wire.lastValue === LogicValue.LOW}
		class:stroke-w_x={$wire.lastValue === LogicValue.X}
		class:stroke-w_z={$wire.lastValue === LogicValue.Z}
		class:opacity-25={$wire.lastValue === LogicValue.Z}
		class="fill-transparent stroke-[5] transition-colors duration-100"
		class:dashed={is_hovering}
		stroke-linecap={is_hovering?"round":"inherit"}
		d={genPath($conA.x, $conA.y, $conB.x, $conB.y)}
	/>
</g>
<InfoText
	bind:show={$showIndices}
	x={($conA.x + getOffset(type_a) + $conB.x + getOffset(type_b)) / 2}
	y={($conA.y + $conB.y) / 2}
	classes={'fill-white stroke-black'}
>
	{$wire.id}
</InfoText>

<style>
	.dashed {
		stroke-dasharray: 15 15;
		animation: moving_dashes 15s linear infinite;
	}
	@keyframes moving_dashes {
		from {
			stroke-dashoffset: 100%;
		}
		to {
			stroke-dashoffset: 0%;
		}
	}
</style>
