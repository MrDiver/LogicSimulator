<script lang="ts">
	import { currentPlaceableComponent, lm } from '$lib/shared/stores/global-config';
	import type { Component } from '$lib/simulator';
	import * as LS from '$lib/simulator';
	import Sink from '../gates/Sink.svelte';
	import Source from '../gates/Source.svelte';
	import GenericNode from '../GenericNode.svelte';

	let registered = [LS.Source, LS.Sink, LS.Inverter, LS.AndGate, LS.OrGate];
	const menu_lm = new LS.LM();
	let instances = registered.map((con) => menu_lm.createComponent(con));

    function handleOnClick(idx:number){
        $lm.createComponent(registered[idx]);
        $lm = $lm
    }
</script>

<div
	id="component-menu"
	class="flex flex-col rounded-lg scroll-y gap-4 h-75 bg-gray-100 drop-shadow-lg border-slate-500 border-2 p-5 absolute left-5 top-10 bottom-10"
>
	{#each instances as c,i}
		<span class="cursor-grab border-2 border-slate-500 border-dashed" on:mousedown={e => handleOnClick(i)}>
			<div class="scale-50 w-[50px] h-[50px] translate-x-[-25%] translate-y-[-25%] pointer-events-none">
				{#if c instanceof LS.Source}
					<Source
						on:cancel_port_connect={() => {
							return;
						}}
						abstract_node={c}
					/>
				{:else if c instanceof LS.Sink}
					<Sink
						on:cancel_port_connect={() => {
							return;
						}}
						abstract_node={c}
					/>
				{:else}
					<GenericNode
						on:cancel_port_connect={() => {
							return;
						}}
						abstract_node={c}
					/>
				{/if}
			</div>
		</span>
	{/each}
</div>
