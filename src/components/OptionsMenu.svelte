<script>
	import { showPositions } from '../stores/global-config';
	import ToggleButton from './ToggleButton.svelte';
</script>

<div>
	<ToggleButton bind:value={$showPositions}>Show Positions</ToggleButton>
</div>

<style>
	div {
		display: flex;
		margin: 1em;
	}
</style>
