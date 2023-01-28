<script lang="ts">
	import { cubicInOut, elasticOut } from 'svelte/easing';
	import { fly, blur, fade } from 'svelte/transition';
	import GenericNode from '../GenericNode.svelte';
	import { LogicValue, type Sink } from '../simulator';
	export let abstract_node: Sink;
	const in_pin = abstract_node.getInput(0).getStore();

	const win_size = 60;
	let width = 80;
	let height = 80;

	function spin(node: SVGElement, { factor = 1, offset = 0 }) {
		return {
			duration: 400,
			css: (t: number) => {
				const eased = cubicInOut(t);

				return `
					transform: rotate(${factor * (eased + offset) * 90}deg);
                    opacity: ${eased * 100}%;
                    `;
			}
		};
	}
</script>

<GenericNode
	{width}
	{height}
	show_labels={false}
	show_name={false}
	on:cancel_port_connect
	{abstract_node}
>
	<rect
		class="fill-slate-700/30 stroke-black stroke-2"
		rx="10"
		ry="10"
		x={-width / 2}
		y={-height / 2}
		{width}
		{height}
	/>
	{#key $in_pin.lastValue}
		<g>
			<rect
				class="stroke-black stroke-2 transition-colors"
				class:fill-w_high={$in_pin.lastValue === LogicValue.HIGH}
				class:fill-w_low={$in_pin.lastValue === LogicValue.LOW}
				class:fill-w_x={$in_pin.lastValue === LogicValue.X}
				class:fill-w_z={$in_pin.lastValue === LogicValue.Z}
				class:opacity-25={$in_pin.lastValue === LogicValue.Z}
				x={-win_size / 2}
				y={-win_size / 2}
				width={win_size}
				height={win_size}
				out:spin={{ factor: -1 }}
				in:spin={{}}
			/>
			<text
				in:spin={{ factor: 1, offset: -1 }}
				out:spin={{ factor: -1, offset: -1 }}
				class="fill-black"
				font-size={20}
				font-family="mono"
				text-anchor="middle"
				dominant-baseline="middle"
				x={0}
				y={0}>{$in_pin.lastValue}</text
			>
		</g>
	{/key}
</GenericNode>
