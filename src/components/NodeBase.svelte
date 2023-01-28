<script lang="ts">
	import { showPositions, useGrid } from '../stores/global-config';
	import { zoomLevel, gridSpacing } from '../stores/global-config';
	import { spring } from 'svelte/motion';
	import InfoText from './InfoText.svelte';
	import { writable } from 'svelte/store';

	export let width: number;
	export let height: number;
	export let isDragging = false;
	let x = -width / 2;
	let y = -height / 2;
	export let position = writable({ x, y });
	function toGrid(x: number): number {
		if ($useGrid) {
			return Math.round(x / $gridSpacing) * $gridSpacing;
		}
		return x;
	}

	function handleDragStart(e: MouseEvent) {
		console.debug('[NodeBase] Drag Started');
		isDragging = true;
	}

	function handleDragStop(e: MouseEvent) {
		console.debug('[NodeBase] Drag Stopped');
		isDragging = false;
        $position.x = toGrid(x);
        $position.y = toGrid(y);
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			x += e.movementX * $zoomLevel;
			y += e.movementY * $zoomLevel;
		}
	}
	$: {
		if ($useGrid) {
			$position = { x: toGrid(x), y: toGrid(y) };
		} else {
			$position = { x: x, y: y };
		}
		$position.x -= width / 2;
		$position.y -= height / 2;
	}
</script>

<!-- svelte-ignore missing-declaration -->
<svg
	x={$position.x}
	y={$position.y}
	class="overflow-visible"
	on:mousedown={handleDragStart}
	class:cursor-grabbing={isDragging}
	class:cursor-grab={!isDragging}
>
	<slot />
	<InfoText
		x={0}
		y_offset={-15}
		y={0}
		text_anchor="middle"
		text_baseline="bottom"
		bind:show={$showPositions}
	>
		x: {Math.round($position.x)} y: {Math.round($position.y)}
	</InfoText>
</svg>

<svelte:window on:mouseup={handleDragStop} on:mousemove={handleMouseMove} />
