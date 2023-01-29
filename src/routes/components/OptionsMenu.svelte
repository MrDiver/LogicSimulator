<script>
	import { showIndices, showPositions, useGrid } from '../stores/global-config';
	import ToggleButton from './ToggleButton.svelte';
</script>

<div class="flex p-1 flex-row gap-2">
	<ToggleButton bind:value={$showPositions}>Show Positions</ToggleButton>
    <ToggleButton bind:value={$showIndices}>Show Indices</ToggleButton>
    <ToggleButton bind:value={$useGrid}>Use Grid</ToggleButton>
</div>

