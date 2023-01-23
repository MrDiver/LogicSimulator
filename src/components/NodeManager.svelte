<script lang="ts">
	import { onMount } from 'svelte';
    import GenericNode from './GenericNode.svelte';
import * as LGB from './types';
	import Wire from './Wire.svelte';
	//let tmp = new LGB.MainTest();
	//tmp.crazy_func();

    let inv1 = new LGB.Inverter();
    let inv2 = new LGB.Inverter();
    let wires :{a:SVGElement,b:SVGElement,node:LGB.Wire}[]= [];
    let w = new LGB.Wire(inv1.out_ports[0], inv2.in_ports[0]);
    console.log(w);
    console.log(inv1);
</script>

<GenericNode bind:abstract_node={inv1}/>
<GenericNode bind:abstract_node={inv2}/>

{#each wires as wire}
    <Wire bind:node_a={wire.a} bind:node_b={wire.b} bind:wire_node={wire.node}/>
{/each}
