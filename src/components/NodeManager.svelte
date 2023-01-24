<script lang="ts">
	import { onMount } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { currentConnectedPort, isConnectingState, secondaryConnectedPort } from '../stores/global-config';
    import GenericNode from './GenericNode.svelte';
import * as LGB from './types';
	import Wire from './Wire.svelte';
	// let tmp = new LGB.MainTest();
	// tmp.crazy_func();

    let inv1 = writable(new LGB.Inverter());
    let inv2 = writable(new LGB.Inverter());
    let wires :{node_a:Writable<LGB.ConnectionPoint>,node_b:Writable<LGB.ConnectionPoint>, wire:LGB.Wire}[]= [];
    
    let current_primary_port_store = null;
    function handleCancelPortConnect(e:CustomEvent<null>){
        current_primary_port_store = null;
        if($currentConnectedPort!==null && $secondaryConnectedPort!==null){
            console.log("TRYING TO CONNECT NODES")
            let w = {node_a: $currentConnectedPort.store, node_b: $secondaryConnectedPort.store, wire: new LGB.Wire($currentConnectedPort.source, $secondaryConnectedPort.source)}
            console.log(w);
            wires.push(w);
            wires = wires;
        }else{
            console.log("CANCEL CONNECTING");
        }
        currentConnectedPort.set(null);
        secondaryConnectedPort.set(null);
    }
</script>

{#each wires as {node_a,node_b,wire}}
    <Wire node_a={node_a} node_b={node_b} bind:wire_node={wire}/>
{/each}
<GenericNode on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={$inv1}/>
<GenericNode on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={$inv2}/>

