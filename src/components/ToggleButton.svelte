<script>
	export let value = false;

	function toggle() {
		value = !value;
	}
</script>

<button
	class="text-white text-center text-sm font-sans rounded-full px-5 py-2 transition-colors"
	class:bg-green-500={value}
	class:bg-red-600={!value}
	on:click={toggle}><slot /></button
>
