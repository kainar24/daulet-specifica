<script lang="ts">
  import { resolve } from '$app/paths';
  import { renderTex } from '@pt/ui';
  import Page from '$lib/components/Page.svelte';
  import { CARDS } from '$lib/cards';
  import { CORE, CORE_FLAT, LOOKUP } from '$lib/core';

  const numberOf = new Map(CORE_FLAT.map((f, i) => [f.id, i + 1]));
  const titleOf = new Map(CORE_FLAT.map((f) => [f.id, f.title]));
  const cardTitle = new Map(CARDS.map((c) => [c.id, c.title]));
</script>

<svelte:head><title>Главные формулы · daulet-specifica</title></svelte:head>

<Page narrow>
  <div class="page-header"><h1>Главные формулы</h1></div>
  <p class="lead">
    {CORE_FLAT.length} формул, без которых Exam 4 не решить. Они идут по порядку темы: каждая следующая опирается на
    предыдущие. У каждой есть расшифровка букв, подсказка, когда её брать, и разбор настоящей задачи из Set 4.
  </p>

  <section class="method">
    <h2>Как решать любую задачу</h2>
    <ol>
      <li><b>Прочитай вопрос в конце.</b> Что именно надо найти и в каких единицах.</li>
      <li><b>Выпиши, что дано</b>, и сразу переведи в СИ: кг, м, м³, Па, K.</li>
      <li><b>Найди тему по словам</b> в таблице «Где брать формулу» ниже.</li>
      <li><b>Возьми формулу, где искомое — единственная неизвестная.</b> Если неизвестных две, сначала найди одну по другой формуле.</li>
      <li><b>Вырази искомое</b>, подставь числа, проверь знак и единицу.</li>
    </ol>
  </section>

  <h2>Где брать формулу</h2>
  <div class="scroll">
    <table>
      <thead><tr><th>В условии</th><th>Формула</th></tr></thead>
      <tbody>
        {#each LOOKUP as [words, ids] (words)}
          <tr>
            <td>{words}</td>
            <td>
              {#each ids as id, i (id)}{#if i > 0}{', '}{/if}<a href="#{id}">№{numberOf.get(id)} {titleOf.get(id)}</a>{/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#each CORE as section, s (section.title)}
    <h2 class="section">{s + 1}. {section.title}</h2>
    <p class="intro">{section.intro}</p>

    {#each section.formulas as f (f.id)}
      <article class="card" id={f.id}>
        <header>
          <span class="rank">{numberOf.get(f.id)}</span>
          <h3>{f.title}</h3>
        </header>

        <div class="formula">{@html renderTex(f.tex, true)}</div>

        <dl class="letters">
          {#each f.letters as [sym, meaning] (sym)}
            <dt>{@html renderTex(sym)}</dt>
            <dd>{meaning}</dd>
          {/each}
        </dl>

        <p><b>Смысл.</b> {f.idea}</p>
        <p><b>Когда брать.</b> {f.when}</p>
        {#if f.trap}<p class="trap"><b>Осторожно.</b> {f.trap}</p>{/if}

        {#if f.example}
          <div class="example">
            <p class="ex-title">Пример: задача {f.example.label}</p>
            <p class="given">{f.example.given}</p>
            {#each f.example.steps as step (step)}
              <div class="formula small">{@html renderTex(step, true)}</div>
            {/each}
            <p class="answer">Ответ: {f.example.answer}</p>
          </div>
        {/if}

        {#if f.cards.length}
          <p class="cards">
            Тренироваться на этой формуле:
            {#each f.cards as id, i (id)}{#if i > 0}{', '}{/if}<a href="{resolve('/formulas/')}#{id}">{cardTitle.get(id)}</a>{/each}
          </p>
        {/if}
      </article>
    {/each}
  {/each}

  <p class="next">
    Разобрался? Теперь иди в <a href={resolve('/formulas/')}>Формулы Даулета</a>: там готовые формулы под каждую из 150 задач.
  </p>
</Page>

<style>
  .lead { color: #495057; }
  h2 { margin-top: 1.75rem; font-size: 1.3rem; }
  h2.section { margin-top: 2.25rem; padding-bottom: 0.3rem; border-bottom: 2px solid #24346c; color: #24346c; }
  .intro { color: #495057; }
  .method { margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 0.5rem; background: #eef1f8; }
  .method h2 { margin-top: 0.25rem; }
  .method li { margin-bottom: 0.35rem; }
  .scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.925rem; }
  th, td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #dee2e6; text-align: left; vertical-align: top; }
  td:last-child { white-space: nowrap; }
  .card { margin-bottom: 1rem; padding: 1rem; border: 1px solid #dee2e6; border-radius: 0.5rem; background: #fff; scroll-margin-top: 76px; }
  .card header { display: flex; align-items: center; gap: 0.6rem; }
  .card h3 { flex: 1; margin: 0; font-size: 1.15rem; }
  .rank { display: inline-grid; flex: none; place-items: center; width: 1.8rem; height: 1.8rem; border-radius: 50%; background: #24346c; color: #fff; font-size: 0.85rem; font-weight: 700; }
  .formula { overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; font-size: 1.2rem; }
  .formula.small { font-size: 1rem; }
  .example .formula.small :global(.katex-display) { margin: 0.3rem 0; }
  .letters { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 0.25rem 0.75rem; margin: 0.5rem 0 0.75rem; font-size: 0.925rem; }
  .letters dt { font-weight: 400; }
  .letters dd { margin: 0; color: #343a40; }
  .trap { padding: 0.5rem 0.75rem; border-left: 3px solid #e0a100; background: #fff9e6; font-size: 0.925rem; }
  .example { margin-top: 0.75rem; padding: 0.6rem 0.8rem; border-left: 3px solid #198754; background: #f4fbf7; }
  .ex-title { margin: 0; font-weight: 700; color: #146c43; }
  .given { margin: 0.25rem 0; }
  .answer { margin: 0.25rem 0 0; font-weight: 700; color: #146c43; }
  .cards { margin: 0.75rem 0 0; font-size: 0.875rem; color: #495057; }
  .next { margin-top: 1.5rem; font-weight: 600; }
</style>
