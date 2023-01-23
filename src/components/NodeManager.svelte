<script lang="ts">
	import { onMount } from 'svelte';
    import GenericNode from './GenericNode.svelte';
import * as LGB from './types';
	import Wire from './Wire.svelte';
	let tmp = new LGB.MainTest();
	// tmp.crazy_func();

    let inv1 = new LGB.Inverter();
    let inv2 = new LGB.Inverter();
    let wires :LGB.Wire[]= [];
    let w = new LGB.Wire(inv1.out_ports[0], inv2.in_ports[0]);
    wires.push(w);
    wires=wires;
    console.log(w);
    console.log(inv1);
    function handleStartPortConnect(e:CustomEvent<{source:LGB.IPort}>){
        console.log("START PORT CONNECT");
        console.log(e);
    }
</script>

<GenericNode on:start_port_connect={handleStartPortConnect} bind:abstract_node={inv1}/>
<GenericNode on:start_port_connect={handleStartPortConnect} bind:abstract_node={inv2}/>

{#each wires as wire}
    <Wire bind:wire_node={wire}/>
{/each}
