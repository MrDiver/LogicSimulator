<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { showPositions } from '../stores/global-config';
    import {PortType, type IPort} from './types';
	export let pos_x: number;
	export let pos_y: number;
	export let type: PortType = PortType.IN;
    export let connected = false;
    export let port_node:IPort;
    const label = port_node.port_name;
    $:port_node.pos_x = pos_x;
    $:port_node.pos_y = pos_y;
    
    const port_size = 8;
    const label_margin = 7;
    let label_offset:number;
    let text_anchor:string;
    switch (type){
        case PortType.IN:{
            label_offset = label_margin;
            text_anchor='start';
            break;
        } 
        case PortType.OUT:{
            label_offset = -label_margin;
            text_anchor='end';
            break;
        } 
    }

    const dispatch = createEventDispatcher();
    function handleMouseDown(e:MouseEvent){
        console.debug("[Port] Was clicked")
        dispatch('start_port_connect',
            {source: port_node}
        )
    }
    
</script>

<circle
    on:mousedown={handleMouseDown}
    id="{port_node.port_name}"
	class="{connected? 'fill-transparent':'fill-lime-600/40'} hover:fill-lime-600 hover:stroke-black/40 transition-colors ease-in-out duration-100"
	cx={pos_x}
	cy={pos_y}
	r="{port_size}"
/>

{#if label!==null}
    <text font-family="sans" text-anchor="{text_anchor}" dominant-baseline="middle" x="{pos_x+label_offset}" y="{pos_y}">{label}</text>
{/if}

{#if $showPositions}
    <text transition:fade fill="red" font-family="sans" text-anchor="{text_anchor}" dominant-baseline="middle" x="{pos_x-20*label_offset}" y="{pos_y}">x: {port_node.pos_x} y: {port_node.pos_y}</text>
{/if}
