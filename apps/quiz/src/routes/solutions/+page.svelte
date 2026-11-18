<script lang="ts">
  import { resolve } from '$app/paths';
  import { renderTex } from '@pt/ui';
  import Page from '$lib/components/Page.svelte';
  import { app } from '$lib/app.svelte';
  import { type Card, CARDS, type CardRow, prettyCalc, SECTIONS } from '$lib/cards';
  import { CORE_FLAT } from '$lib/core';
  import { formatAnswer, type Problem, PROBLEMS, SET_ID } from '$lib/study.svelte';

  interface Solution {
    label: string;
    num: number;
    problem: Problem;
    card: Card;
    row: CardRow;
    line: string;
  }

  const SOLUTIONS: Solution[] = CARDS.flatMap((card) =>
    card.rows.flatMap((row) =>
      row.items.map(([label, line]) => ({ label, num: Number(label.slice(1)), problem: PROBLEMS.get(label)!, card, row, line })),
    ),
  ).sort((a, b) => a.num - b.num);

  /** Core formulas behind each card, with their numbers on the core page. */
  const coreOf = new Map(
    CARDS.map((c) => [
      c.id,
      CORE_FLAT.map((f, i) => ({ f, n: i + 1 })).filter(({ f }) => f.id !== 'kelvin' && f.cards.includes(c.id)),
    ]),
  );

  let query = $state('');
  let section = $state<number | null>(null);
  let hide = $state(false);
  let shown = $state<Record<string, boolean>>({});

  const q = $derived(query.trim().toLowerCase());
  const list = $derived(
    SOLUTIONS.filter((s) => {
      if (section !== null && s.card.section !== section) return false;
      if (!q) return true;
      const n = /^p?(\d{1,3})$/.exec(q);
      if (n) return s.num === Number(n[1]);
      return `${s.problem.text} ${s.card.title} ${s.row.q}`.toLowerCase().includes(q);
    }),
  );

  function setHide(on: boolean): void {
    hide = on;
    shown = {};
  }
</script>

<svelte:head><title>Решение · daulet-specifica</title></svelte:head>

<Page narrow>
  <div class="page-header"><h1>Решение</h1></div>
  <p class="lead">
    Все 150 задач по порядку: условие, что спрашивают, формула, подстановка чисел и ответ. Каждая подстановка проверена: она
    даёт ответ из документа. Если не понимаешь, откуда формула, жми ссылку на <a href={resolve('/core/')}>Главные формулы</a>.
  </p>

  <div class="tools">
    <input class="form-control search" type="search" placeholder="Номер или слово из условия: 24, P90, kettle" aria-label="Поиск задачи" bind:value={query} />
    <div class="chips" role="group" aria-label="Раздел">
      <button type="button" class="chip" aria-pressed={section === null} onclick={() => (section = null)}>Все</button>
      {#each SECTIONS as name, i (name)}
        <button type="button" class="chip" aria-pressed={section === i} onclick={() => (section = i)}>{name}</button>
      {/each}
    </div>
    <label><input type="checkbox" checked={hide} onchange={(e) => setHide(e.currentTarget.checked)} /> Спрятать решения: сначала реши сам</label>
  </div>

  {#if !q && section === null}
    <details class="jump">
      <summary>Перейти к задаче по номеру</summary>
      <div class="numbers">
        {#each SOLUTIONS as s (s.label)}<a href="#{s.label}">{s.num}</a>{/each}
      </div>
    </details>
  {/if}

  <p class="muted">Показано задач: {list.length}</p>

  {#each list as s (s.label)}
    <article class="card" id={s.label}>
      <header>
        <span class="num">{s.label}</span>
        <span class="topic">{SECTIONS[s.card.section]} · {s.card.title}</span>
      </header>

      <p class="text">{s.problem.text}</p>
      {#if s.problem.fig}<img src={app.resolveSrc(SET_ID)(s.problem.fig)} alt="Рисунок к задаче {s.label}" loading="lazy" />{/if}

      {#if hide && !shown[s.label]}
        <button type="button" class="reveal" onclick={() => (shown[s.label] = true)}>Показать решение</button>
      {:else}
        <div class="solution">
          <p class="step"><b>1. Что спрашивают:</b> {s.row.q}</p>
          <p class="step"><b>2. Формула:</b></p>
          <div class="formula">{@html renderTex(s.row.tex, true)}</div>
          <p class="step"><b>3. Подставляем</b> (всё в СИ):</p>
          <code class="calc">{prettyCalc(s.line)}</code>
          <p class="answer">Ответ: {formatAnswer(s.problem)}</p>
          {#if s.card.trap}<p class="trap"><b>Ловушка.</b> {s.card.trap}</p>{/if}
          <p class="links">
            {#each coreOf.get(s.card.id) ?? [] as { f, n } (f.id)}<a href="{resolve('/core/')}#{f.id}">№{n} {f.title}</a>{' · '}{/each}<a href="{resolve('/formulas/')}#{s.card.id}">Карточка Даулета</a>
          </p>
        </div>
      {/if}
    </article>
  {/each}

  {#if list.length === 0}
    <p class="muted">Ничего не нашлось. Попробуй номер задачи или другое слово.</p>
  {/if}
</Page>

<style>
  .lead { color: #495057; }
  .tools { display: grid; gap: 0.75rem; margin-bottom: 1rem; }
  .search { width: 100%; max-width: none; }
  .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .chip { padding: 0.35rem 0.8rem; border: 1px solid #ced4da; border-radius: 999px; background: #fff; color: #212529; cursor: pointer; }
  .chip[aria-pressed='true'] { border-color: #24346c; background: #24346c; color: #fff; }
  .jump { margin-bottom: 0.75rem; }
  .jump summary { color: #0f6cbf; cursor: pointer; }
  .numbers { display: grid; grid-template-columns: repeat(auto-fill, minmax(2.6rem, 1fr)); gap: 0.3rem; margin-top: 0.5rem; }
  .numbers a { padding: 0.2rem 0; border: 1px solid #dee2e6; border-radius: 0.25rem; text-align: center; font-size: 0.85rem; text-decoration: none; }
  .muted { color: #495057; font-size: 0.875rem; }
  .card { margin-bottom: 1rem; padding: 1rem; border: 1px solid #dee2e6; border-radius: 0.5rem; background: #fff; scroll-margin-top: 76px; }
  .card header { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem 0.6rem; }
  .num { flex: none; padding: 0.1rem 0.5rem; border-radius: 0.25rem; background: #24346c; color: #fff; font-weight: 700; }
  .topic { color: #495057; font-size: 0.875rem; }
  .text { margin: 0.6rem 0; }
  img { display: block; max-width: min(100%, 320px); max-height: 260px; margin-bottom: 0.75rem; background: #fff; }
  .reveal { width: 100%; padding: 1rem; border: 1px dashed #868e96; border-radius: 0.5rem; background: #f8f9fa; color: #24346c; font-weight: 600; cursor: pointer; }
  .solution { padding: 0.6rem 0.8rem; border-left: 3px solid #198754; background: #f4fbf7; }
  .step { margin: 0.3rem 0 0; }
  .formula { overflow-x: auto; overflow-y: hidden; font-size: 1.05rem; }
  .formula :global(.katex-display) { margin: 0.4rem 0; }
  .calc { display: block; margin: 0.3rem 0; padding: 0.4rem 0.6rem; border-radius: 0.25rem; background: #fff; color: #212529; overflow-wrap: anywhere; }
  .answer { margin: 0.4rem 0 0; color: #146c43; font-weight: 700; overflow-wrap: anywhere; }
  .trap { margin: 0.5rem 0 0; padding: 0.4rem 0.6rem; border-left: 3px solid #e0a100; background: #fff9e6; font-size: 0.875rem; }
  .links { margin: 0.5rem 0 0; font-size: 0.875rem; }
</style>
