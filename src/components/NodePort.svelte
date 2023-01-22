<script lang="ts">
    import {PortType} from './types';
	export let pos_x: number;
	export let pos_y: number;
	export let label: string | null = 'Test';
	export let type: PortType = PortType.IN;
    export let connected = false;
    
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
	class="{connected? 'fill-transparent':'fill-lime-600/40'} hover:fill-lime-600 hover:stroke-black/40 transition-colors ease-in-out duration-100"
	cx={pos_x}
	cy={pos_y}
	r="{port_size}"
/>

{#if label!==null}
    <text font-family="sans" text-anchor="{text_anchor}" dominant-baseline="middle" x="{pos_x+label_offset}" y="{pos_y}">{label}</text>
{/if}
