<script lang="ts">
	import { showPositions, useGrid } from '../stores/global-config';
	import { fade } from 'svelte/transition';
	import { zoomLevel, gridSpacing } from '../stores/global-config';
	import { spring } from 'svelte/motion';
	import InfoText from './InfoText.svelte';

	export let width: number;
	export let height: number;
	export let isDragging = false;
	let x = -width / 2;
	let y = -height / 2;
	export let position = spring({ x, y }, {stiffness:1,damping:1});
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
        x = $position.x+width/2;
        y = $position.y+width/2;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			x += e.movementX * $zoomLevel;
			y += e.movementY * $zoomLevel;
		}
	}
	$: {
        $useGrid;
		$position = { x: toGrid(x) - width / 2, y: toGrid(y) - height / 2 };
	}
</script>

<!-- svelte-ignore missing-declaration -->
<svg
	x={Math.round($position.x)}
	y={Math.round($position.y)}
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
