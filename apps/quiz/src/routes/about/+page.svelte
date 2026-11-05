<script lang="ts">
	import { resolve } from "$app/paths";
	import Page from "$lib/components/Page.svelte";
</script>

<svelte:head><title>About · daulet-specifica</title></svelte:head>

<Page narrow>
	<ol class="breadcrumb">
		<li><a href={resolve("/")}>Home</a></li>
		<li>About</li>
	</ol>
	<div class="page-header">
		<h1>About</h1>
	</div>

	<p>Сайт для подготовки к Exam 4: задачи, формулы, тренажёр и лайфхаки. Прогресс хранится в этом браузере.</p>
	<p>
		Движок экзамена и банк задач взяты из открытого проекта
		<a href="https://github.com/omgaXD/pt-nu-phys161" target="_blank" rel="noopener noreferrer">pt-nu-phys161</a>
		от <b>@omgaxd</b> (лицензия MIT). Спасибо за него!
	</p>
</Page>
