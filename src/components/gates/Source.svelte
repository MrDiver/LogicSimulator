<script lang="ts">
	import { fly } from 'svelte/transition';
	import GenericNode from '../GenericNode.svelte';
	import { LogicValue, type Source } from '../simulator';
	export let abstract_node: Source;
	const node = abstract_node.getStore();
	const out_pin = abstract_node.getOutput(0).getStore();

	const win_size = 30;
	const button_size = 30;
	const button_margin = 20;
	let width = button_size * 2 + button_margin;
	let height = button_size * 2 + button_margin;
</script>

<GenericNode
	{width}
	{height}
	show_labels={false}
	show_name={false}
	on:cancel_port_connect
	{abstract_node}
>
	{#key $out_pin.lastValue}
		<g transition:fly={{ y: win_size, duration: 400 }}>
			<rect
				class="stroke-black stroke-2 transition-colors"
				class:fill-w_high={$out_pin.lastValue === LogicValue.HIGH}
				class:fill-w_low={$out_pin.lastValue === LogicValue.LOW}
				class:fill-w_x={$out_pin.lastValue === LogicValue.X}
				class:fill-w_z={$out_pin.lastValue === LogicValue.Z}
				class:opacity-25={$out_pin.lastValue === LogicValue.Z}
				x={-win_size / 2}
				y={-win_size - height / 2}
				width={win_size}
				height={win_size}
			/>
			<text
				class="fill-black"
				font-size={20}
				font-family="mono"
				text-anchor="middle"
				dominant-baseline="middle"
				x={0}
				y={-height / 2 - win_size / 2}>{$out_pin.lastValue}</text
			>
		</g>
	{/key}
	<rect
		class="fill-slate-700/30 stroke-black stroke-2"
		rx="10"
		ry="10"
		x={-width / 2}
		y={-height / 2}
		{width}
		{height}
	/>
	{#each [LogicValue.Z, LogicValue.X, LogicValue.LOW, LogicValue.HIGH] as lv, i}
		<g
			class="hover:fill-blue-500 fill-gray-700 transition duration-100 ease-in-out cursor-pointer"
			on:mousedown={(e) => {
				$node.setValue(lv);
			}}
		>
			<rect
				class="stroke-black stroke-2"
				x={((i % 2) * (width - button_margin)) / 2 + button_margin / 2 - width / 2}
				y={(+(i > 1) * (height - button_margin)) / 2 + button_margin / 2 - height / 2}
				width={button_size}
				height={button_size}
			/>
			<text
				class="fill-white"
				x={((i % 2) * (width - button_margin)) / 2 +
					button_margin / 2 +
					button_size / 2 -
					width / 2}
				y={(+(i > 1) * (height - button_margin)) / 2 +
					button_margin / 2 +
					button_size / 2 -
					height / 2}
				font-size={20}
				font-family="mono"
				text-anchor="middle"
				dominant-baseline="middle">{lv}</text
			>
		</g>
	{/each}
</GenericNode>
