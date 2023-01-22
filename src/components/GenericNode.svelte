<script lang="ts">
    import NodeBase from './NodeBase.svelte';
    import NodePort from './NodePort.svelte';
	import { PortType } from './types';

    // Attributes
    let in_ports=3;
    let out_ports=1;
    const port_margin = 20;

    const width=100;
    const height=((Math.max(in_ports,out_ports)+2)*port_margin);
    let pos_x = 0;
    let pos_y = 0;

    function calc_port(id:number, num_ports:number, dimension:number){
        const port_spacing = (dimension+port_margin)/(num_ports+1)
        return (id+1)*port_spacing-port_margin/2;
    }

</script>

<NodeBase bind:pos_x bind:pos_y>
    <rect fill="white" stroke="black" stroke-width="2" x="0" y="0" rx="10" ry="10" width="{width}" height="{height}" />
    {#each Array(in_ports) as _, i}
        <NodePort type={PortType.IN} pos_x="0" pos_y="{calc_port(i,in_ports,height)}"/>
    {/each}
    {#each Array(out_ports) as _, i}
        <NodePort type={PortType.OUT} pos_x="{width}" pos_y="{calc_port(i,out_ports,height)}"/>
    {/each}
</NodeBase>
