<script lang="ts">
	import { showPositions, useGrid } from '../stores/global-config';
	import { zoomLevel, gridSpacing } from '../stores/global-config';
	import { spring, tweened } from 'svelte/motion';
	import { cubicInOut, quadInOut } from 'svelte/easing';
	import InfoText from './InfoText.svelte';
	import { writable } from 'svelte/store';

	export let width: number;
	export let height: number;
	export let viewWidth: number;
	export let viewHeight: number;
	export let isDragging = false;
	export let init_x;
	export let init_y;
	let x = init_x;
	let y = init_y;
	export let position = { x, y };
	let sp = spring({ x, y }, { stiffness: 0.5, damping: 0.5 });
	//let sp = tweened({ x, y }, {duration: 50, easing: quadInOut});
	$: position = $sp;
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
		x = $sp.x;
		y = $sp.y;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			x += e.movementX * $zoomLevel;
			y += e.movementY * $zoomLevel;
		}
	}
	$: {
		if ($useGrid) {
			$sp = { x: toGrid(x), y: toGrid(y) };
		} else {
			$sp = { x: x, y: y };
		}
	}
</script>

<!-- svelte-ignore missing-declaration -->
<svg
	x={$sp.x - viewWidth / 2}
	y={$sp.y - viewHeight / 2}
	viewBox="{-viewWidth / 2} {-viewHeight / 2} {viewWidth + 2} {viewHeight}"
	width={viewWidth}
	height={viewHeight}
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
		x: {Math.round($sp.x)} y: {Math.round($sp.y)}
	</InfoText>
	{#if $showPositions}
		<circle class="fill-red-500" cx="0" cy="0" r="2" />
	{/if}
</svg>

<svelte:window on:mouseup={handleDragStop} on:mousemove={handleMouseMove} />
