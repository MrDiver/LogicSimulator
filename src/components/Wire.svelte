<script lang="ts">
	import { Wire } from './types';
	export let wire_node: Wire;
    let timer = setInterval(()=>console.log(wire_node.a.pos_x),1000);
</script>
