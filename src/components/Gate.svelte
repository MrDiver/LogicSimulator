<script context="module">
	import Positionable from './Positionable.svelte';
	let n_gates = 0;
	let position = { x: 0, y: 0 };
</script>

<script>
	let id = n_gates++;
	let width = 4;
	let height = 4;
</script>

<Positionable bind:position>
	<div style="width: {width}em; height: {height}em">{id}</div>
</Positionable>

<style>
	div {
		display: flex;
		flex-flow: row nowrap;
		justify-content: center;
		align-items: center;
		border: 2px solid black;
		border-radius: 0.2em;
	}
</style>
