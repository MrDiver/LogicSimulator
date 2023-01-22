<script lang="ts">
	import { showPositions } from '../stores/global-config';
    import {fade} from 'svelte/transition';

    let svg_wrapper: SVGSVGElement;
    export let pos_x = 0;
    export let pos_y = 0;
	let isDragging = false;

	function handleDragStart(e: MouseEvent) {
        console.debug("[NodeBase] Drag Started");
		isDragging = true;
	}

	function handleDragStop(e: MouseEvent) {
        console.debug("[NodeBase] Drag Stopped");
		isDragging = false;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			pos_x += e.movementX;
			pos_y += e.movementY;
		}
	}
</script>

<svg
    x="{pos_x}" y="{pos_y}" class="overflow-visible"
	on:mousedown={handleDragStart}
    bind:this={svg_wrapper}
>
	<slot />
	{#if $showPositions}
        <text transition:fade fill="red" x="0" y="-20">x:{pos_x} y:{pos_y}</text>
	{/if}
</svg>

<svelte:window on:mouseup={handleDragStop} on:mousemove={handleMouseMove} />

<style>
</style>
