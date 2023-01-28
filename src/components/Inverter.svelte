<script lang="ts">
	import GenericNode from './GenericNode.svelte';
	import type { Inverter } from './simulator';
	export let abstract_node: Inverter;
	const node = abstract_node.getStore();
	const width = 82;
	const height = 90;
</script>

<GenericNode
	{width}
	{height}
	show_labels={false}
	show_name={false}
	on:cancel_port_connect
	{abstract_node}
>
	<path
		d="M75.3021 47.6156L4.2193 87.546C2.2195 88.6694 -0.249997 87.2242 -0.249996 84.9305L-0.249993 5.06953C-0.249993 2.77581 2.2195 1.33058 4.21929 2.45396L75.302 42.3844C77.343 43.5309 77.343 46.4691 75.3021 47.6156Z"
        class="fill-slate-500/40 stroke-black stroke-2"
	/>
	<circle cx="82" cy="45" r="7" fill="white" stroke="black" stroke-width="2" />
</GenericNode>
