<script lang="ts">
    import {PortType, type IPort} from './types';
	export let pos_x: number;
	export let pos_y: number;
	export let type: PortType = PortType.IN;
    export let connected = false;
    export let port_node:IPort;
    const label = port_node.port_name;
    
    const port_size = 8;
    const label_margin = 7;
    let label_offset:number;
    let text_anchor:string;
    switch (type){
        case PortType.IN:{
            label_offset = label_margin;
            text_anchor='start'
            break;
        } 
        case PortType.OUT:{
            label_offset = -label_margin;
            text_anchor='end'
            break;
        } 
    }
    
</script>

<circle
    bind:this={port_node.dom_node}
    id="{port_node.port_name}"
	class="{connected? 'fill-transparent':'fill-lime-600/40'} hover:fill-lime-600 hover:stroke-black/40 transition-colors ease-in-out duration-100"
	cx={pos_x}
	cy={pos_y}
	r="{port_size}"
/>

{#if label!==null}
    <text font-family="sans" text-anchor="{text_anchor}" dominant-baseline="middle" x="{pos_x+label_offset}" y="{pos_y}">{label}</text>
{/if}
