<script lang="ts">
    import LogicViewer from './components/LogicViewer.svelte';
    import OptionsMenu from './components/OptionsMenu.svelte';
</script>

<div class="flex flex-col h-full">
    <h1 class="p-3 flex-grow-0 flexshrink basis-auto text-4xl font-bold self-center">Logic Simulator</h1>
    <OptionsMenu/>
    <LogicViewer/>
</div>


<style>
    :global(body){
        height:100%;
        margin:0;
    }
    :global(html){
        height:100%;
        margin:0;
    }
</style>
