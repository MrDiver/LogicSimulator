<script lang="ts">
	import {
		currentConnectedPort,
		mouseInsideLogic,
		screenPosition,
		secondaryConnectedPort,
		zoomLevel
	} from '../stores/global-config';
	import { ConnectionType, LogicValue, type Connector, type Wire } from './simulator';

	const type_a: ConnectionType | undefined = $currentConnectedPort?.type;
	let type_b: ConnectionType | undefined;
	$: type_b = type_a
		? type_a === ConnectionType.IN
			? ConnectionType.OUT
			: ConnectionType.IN
		: undefined;
	let offset_a = 0;
	let offset_b = 0;
	let mouse_x = 0;
	let mouse_y = 0;
	function getDistance() {
		if ($currentConnectedPort) {
			const ax = $currentConnectedPort.x;
			const ay = $currentConnectedPort.y;
			const bx = $screenPosition.x;
			const by = $screenPosition.y;
			const dx = bx - ax;
			const dy = by - ay;
			//return Math.min(Math.sqrt(dx * dx + dy * dy), 400);
			return Math.max(Math.abs(dx), 10);
		}
		return 0;
	}
	function getOffset(node_type: ConnectionType | undefined): number {
		if (node_type) {
			if (node_type === ConnectionType.IN) {
				return -getDistance();
			} else if (node_type === ConnectionType.OUT) {
				return getDistance();
			}
		}
		return 0;
	}
	function genPath(ax: number, ay: number, bx: number, by: number) {
		if ($currentConnectedPort) {
			offset_a = getOffset(type_a);
			offset_b = getOffset(type_b);
			return `M ${ax} ${ay}
            C ${ax + offset_a} ${ay}
              ${bx + offset_b} ${by}
              ${bx} ${by}`;
		}
		return '';
	}
</script>

{#if $currentConnectedPort}
	<path
		class="pointer-events-none dashed stroke-w_z fill-transparent stroke-[5] transition-colors"
		stroke-linecap="round"
		d={$secondaryConnectedPort
			? genPath(
					$currentConnectedPort.x,
					$currentConnectedPort.y,
					$secondaryConnectedPort.x,
					$secondaryConnectedPort.y
			  )
			: genPath(
					$currentConnectedPort.x,
					$currentConnectedPort.y,
					($mouseInsideLogic.x*$zoomLevel + $screenPosition.x),
					($mouseInsideLogic.y*$zoomLevel + $screenPosition.y)
			  )}
	/>
{/if}

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
