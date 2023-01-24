<script lang="ts">
	import { Wire } from './types';
	export let wire_node: Wire;
    $: console.log(wire_node.a.pos_x);
</script>
