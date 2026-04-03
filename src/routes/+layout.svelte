<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ZeroOne Hosting</title>
	<meta name="description" content="ZeroOne Hosting Systems Inc. — Lowering expectations since our court date." />
</svelte:head>

{@render children()}
