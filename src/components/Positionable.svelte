<script lang="ts">
	import { showPositions } from '../stores/global-config';

	let position = { x: 0, y: 0 };
	let child = null;
	let isDragging = false;

	function handleDragStart(e: MouseEvent) {
		isDragging = true;
		console.log(e);
	}

	function handleDragStop(e: MouseEvent) {
		isDragging = false;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			position.x += e.movementX;
			position.y += e.movementY;
		}
	}
</script>

<section
	bind:this={child}
	on:mousedown={handleDragStart}
	style="position: absolute; left: {position.x}px; top: {position.y}px"
>
	<slot />
	{#if $showPositions}
		<div id="pos" style="">
			P: {position.x}, {position.y}
		</div>
	{/if}
</section>

<svelte:window on:mouseup={handleDragStop} on:mousemove={handleMouseMove} />

<style>
	#pos {
		border: 2px solid red;
		border-radius: 0.3em;
		font-size: 0.5em;
		width: fit-content;
		padding: 0.3em;
		margin: auto;
		margin-top: 0.5em;
		user-select: none;
	}

	section {
		user-select: none;
	}
</style>
