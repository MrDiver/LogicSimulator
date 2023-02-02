<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { zoomLevel } from '$lib/shared/stores/global-config';

	export let x: number;
	export let x_offset = 0;
	export let y: number;
	export let y_offset = 0;
	export let classes = 'fill-rose-900';
	export let show: boolean;
	export let text_anchor = 'middle';
	export let text_baseline = 'middle';
    export let font_size=20;

</script>

{#if show}
	<text
		transition:fade
		class={'font-sans font-bold drop-shadow-md pointer-events-none ' + classes}
		font-family="sans"
		text-anchor={text_anchor}
        font-size={font_size * $zoomLevel}
        stroke-width={$zoomLevel}
		dominant-baseline={text_baseline}
		x={x + x_offset}
		y={y + y_offset}
	>
		<slot />
	</text>
{/if}
