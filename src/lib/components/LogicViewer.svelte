<script lang="ts">
	import NodeManager from '$lib/components/NodeManager.svelte';
    import {spring} from 'svelte/motion';
	import { currentConnectedPort, gridSpacing, lm, mouseInsideLogic, screenPosition, screenSize, secondaryConnectedPort, shouldSave, zoomLevel } from '$lib/shared/stores/global-config';
	import { LM } from '$lib/simulator';

	let pos_x = 0;
	let pos_y = 0;
    let pos_spring = spring({x:0,y:0},{stiffness: 0.5, damping:0.5});
    $: pos_spring.set({x:pos_x, y:pos_y});
	let zoom = spring(1);
	let width: number;
	let height: number;
	let vx = 0;
	let vy = 0;
	let vw = 1920;
	let vh = 1080;
	let dragging = false;

	let svg_canvas: SVGSVGElement;

	function handleMouseDown(e: MouseEvent) {
		if (svg_canvas === e.target) {
			console.debug('[LogicViewer] Dragging Canvas Started');
			dragging = true;
		}
	}
	function handleMouseUp(e: MouseEvent) {
		dragging = false;
		console.debug('[LogicViewer] Dragging Canvas Stopped');
	}
	function handleMouseMove(e: MouseEvent) {
        $mouseInsideLogic = {x:e.offsetX,y:e.offsetY};
		if (dragging) {
			pos_x -= e.movementX * $zoomLevel;
			pos_y -= e.movementY * $zoomLevel;
		}
	}
	function handleScroll(e: WheelEvent) {
		console.debug('[LogicViewer] Scoll Canvas');
		$zoom += e.deltaY / 500;
		if ($zoom < 0.5) {
			$zoom = 0.5;
		} else if ($zoom > 10) {
			$zoom = 10;
		}
	}
	$: {
		zoomLevel.set($zoom);

		const halfW = width / (2 / $zoom);
		const halfH = height / (2 /$zoom);
		vx = $pos_spring.x - halfW;
		vy = $pos_spring.y - halfH;
		vw = 2 * halfW;
		vh = 2 * halfH;
        $screenSize = {x: vw, y:vh};
        $screenPosition = {x:vx, y:vy};
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} on:wheel={handleScroll} />

<div
	bind:clientWidth={width}
	bind:clientHeight={height}
	class="select-none relative flex-grow flex-shrink basis-auto border border-solid border-black dashed"
>
	<svg
		bind:this={svg_canvas}
		on:mousedown={handleMouseDown}
		class="absolute w-full h-full"
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		viewBox="{vx} {vy} {vw} {vh}"
		style="background-position:{(-vx + 60)/ $zoom}px {(-vy + 60) / $zoom}px;
		background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'{135 /
			$zoom}\' height=\'{135 /
			$zoom}\' viewBox=\'{0} {0} {100} {100}\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23898989\' fill-opacity=\'0.4\'%3E%3Cpath opacity=\'.5\' d=\'M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z\'/%3E%3Cpath d=\'M6 5V0H5v5H0v1h5v94h1V6h94V5H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
        "
	>
		<!-- Nodes for inside the logic viewer go here-->
		<NodeManager />
		<!-- Ending Nodes here -->
	</svg>
	<div
		id="infopanel"
		class="pointer-events-none bg-[rgb(255,255,255,0.7)] p-2 rounded-lg absolute top-3 left-3 text-xl font-mono"
	>
		<p>Position x:{Math.round($pos_spring.x)} y:{Math.round($pos_spring.y)}</p>
		<p>Size w:{width} h:{height}</p>
		<p>vx:{Math.round(vx)} vy:{Math.round(vy)} vw:{Math.round(vw)} vh:{Math.round(vh)}</p>
		<p>Primary: {$currentConnectedPort !== null ? $currentConnectedPort.id : 'null'}</p>
		<p>Secondary: {$secondaryConnectedPort !== null ? $secondaryConnectedPort.id : 'null'}</p>
	</div>
    <div class="absolute top-3 right-3 flex gap-3">
        <div
            id="save-button"
            on:mousedown={(e)=>{shouldSave.set(true)}}
            class="transition-all hover:scale-110  border-2 hover:border-blue-500 border-slate-500/60 bg-white/60 p-2 rounded-lg text-xl font-mono"
        >
            <p>save</p>
        </div>
        <div
            id="save-button"
            on:mousedown={(e)=>{
                window.localStorage.clear();
            }}
            class="transition-all hover:scale-110  border-2 hover:border-blue-500 border-slate-500/60 bg-white/60 p-2 rounded-lg text-xl font-mono"
        >
            <p>clear</p>
        </div>
    </div>
</div>

<style>
	svg {
		background-color: #eae7e5;
	}
</style>
