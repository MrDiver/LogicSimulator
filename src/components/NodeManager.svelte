<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { currentConnectedPort, isConnectingState, secondaryConnectedPort } from '../stores/global-config';
    import GenericNode from './GenericNode.svelte';
import * as LGB from './types';
	import Wire from './Wire.svelte';
	// let tmp = new LGB.MainTest();
	// tmp.crazy_func();

    let inv1 = writable(new LGB.Inverter());
    let inv2 = writable(new LGB.Inverter());
    let wires :LGB.Wire[]= [];
    
    let current_primary_port_store = null;
    function handleCancelPortConnect(e:CustomEvent<null>){
        current_primary_port_store = null;
        if($currentConnectedPort!==null && $secondaryConnectedPort!==null){
            console.log("TRYING TO CONNECT NODES")
        }else{
            console.log("CANCEL CONNECTING");
        }
        currentConnectedPort.set(null);
        secondaryConnectedPort.set(null);
    }
</script>

<GenericNode on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={$inv1}/>
<GenericNode on:cancel_port_connect={handleCancelPortConnect} bind:abstract_node={$inv2}/>

{#each wires as wire}
    <Wire bind:wire_node={wire}/>
{/each}
