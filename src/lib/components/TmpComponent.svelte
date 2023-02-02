<script lang="ts">
	import { currentPlaceableComponent, mouseInsideLogic } from '$lib/shared/stores/global-config';
	import { Component, LM } from '$lib/simulator';
	import Sink from './gates/Sink.svelte';
	import Source from './gates/Source.svelte';
	import GenericNode from './GenericNode.svelte';
    import * as LS from '$lib/simulator'

	let tmp_node:(new (...args:any[])=>Component) | null= null;
	let tmp_lm = new LM();
	$: {
		if ($currentPlaceableComponent) tmp_node = tmp_lm.createComponent($currentPlaceableComponent);
        else tmp_node = null;
	}
</script>

{#if tmp_node !== null}
	{#if tmp_node instanceof LS.Source}
		<Source on:cancel_port_connect={()=>{return}} abstract_node={tmp_node} />
	{:else if tmp_node instanceof LS.Sink}
		<Sink on:cancel_port_connect={()=>{return}} abstract_node={tmp_node} />
	{:else}
		<GenericNode on:cancel_port_connect={()=>{return}} abstract_node={tmp_node} />
	{/if}
{/if}
