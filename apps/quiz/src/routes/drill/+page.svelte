<script lang="ts">
  import { renderTex } from '@pt/ui';
  import { resolve } from '$app/paths';
  import Page from '$lib/components/Page.svelte';
  import { app } from '$lib/app.svelte';
  import { type Card, CARDS, type CardRow, prettyCalc, SECTIONS } from '$lib/cards';
  import { formatAnswer, PROBLEMS, SET_ID } from '$lib/study.svelte';

  interface Item {
    label: string;
    card: Card;
    row: CardRow;
    line: string;
  }

  const ITEMS: Item[] = CARDS.flatMap((card) => card.rows.flatMap((row) => row.items.map(([label, line]) => ({ label, card, row, line }))));

  function shuffled<T>(xs: readonly T[]): T[] {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }

  /** The right card and three others, from the same section when it has enough. */
  function optionsFor(item: Item): Card[] {
    const near = shuffled(CARDS.filter((c) => c !== item.card && c.section === item.card.section));
    return shuffled([item.card, ...near.slice(0, 3)]);
  }

  let section = $state<number | null>(null);
  let queue = $state.raw<Item[]>(shuffled(ITEMS));
  let options = $state.raw<Card[]>([]);
  let picked = $state.raw<Card | null>(null);
  let right = $state(0);
  let total = $state(0);

  const current = $derived(queue[0]);
  const problem = $derived(current ? PROBLEMS.get(current.label) : undefined);

  $effect.pre(() => {
    if (current) options = optionsFor(current);
  });

  function setSection(s: number | null): void {
    section = s;
    queue = shuffled(ITEMS.filter((i) => s === null || i.card.section === s));
    picked = null;
    right = 0;
    total = 0;
  }

  function pick(c: Card): void {
    if (picked || !current) return;
    picked = c;
    total += 1;
    if (c === current.card) right += 1;
  }

  /** A wrong problem comes back five problems later. */
  function next(): void {
    if (!current) return;
    const [head, ...rest] = queue;
    if (picked !== head!.card) rest.splice(Math.min(5, rest.length), 0, head!);
    queue = rest;
    picked = null;
  }
</script>

<svelte:head><title>Тренажёр · daulet-specifica</title></svelte:head>

<Page narrow>
  <div class="page-header"><h1>Тренажёр</h1></div>
  <p class="lead">Читаешь условие и выбираешь карточку. На экзамене главное узнать задачу за 10 секунд. Ошибки вернутся через пять задач.</p>

  <div class="chips" role="group" aria-label="Раздел">
    <button type="button" class="chip" aria-pressed={section === null} onclick={() => setSection(null)}>Все</button>
    {#each SECTIONS as name, i (name)}
      <button type="button" class="chip" aria-pressed={section === i} onclick={() => setSection(i)}>{name}</button>
    {/each}
  </div>
  <p class="score" aria-live="polite">Верно {right} из {total} · осталось {queue.length}</p>

  {#if current && problem}
    <article class="box">
      <p class="label">{current.label}</p>
      <p class="text">{problem.text}</p>
      {#if problem.fig}<img src={app.resolveSrc(SET_ID)(problem.fig)} alt="Рисунок к задаче {current.label}" />{/if}
    </article>

    <div class="options">
      {#each options as o (o.id)}
        <button
          type="button"
          class="option"
          class:correct={picked && o === current.card}
          class:wrong={picked === o && o !== current.card}
          disabled={picked !== null}
          onclick={() => pick(o)}
        >{o.title}</button>
      {/each}
    </div>

    {#if picked}
      <div class="result">
        <p class="verdict" class:bad={picked !== current.card}>{picked === current.card ? 'Верно!' : `Нет, это «${current.card.title}»`}</p>
        <div class="formula">{@html renderTex(current.row.tex, true)}</div>
        <p class="calc"><code>{prettyCalc(current.line)}</code></p>
        <p class="answer">= {formatAnswer(problem)}</p>
        {#if current.card.trap}<p class="trap"><b>Ловушка.</b> {current.card.trap}</p>{/if}
        <div class="actions">
          <button type="button" class="btn btn-primary" onclick={next}>Дальше</button>
          <a class="btn btn-secondary" href="{resolve('/formulas/')}#{current.card.id}">Открыть карточку</a>
        </div>
      </div>
    {/if}
  {:else}
    <div class="alert alert-success">Круг пройден, верно {right} из {total}.</div>
    <button type="button" class="btn btn-primary" onclick={() => setSection(section)}>Ещё круг</button>
  {/if}
</Page>

<style>
  .lead { color: #495057; }
  .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .chip { padding: 0.35rem 0.8rem; border: 1px solid #ced4da; border-radius: 999px; background: #fff; color: #212529; cursor: pointer; }
  .chip[aria-pressed='true'] { border-color: #24346c; background: #24346c; color: #fff; }
  .score { margin: 0.75rem 0; font-weight: 600; }
  .box { padding: 1rem; border: 1px solid #dee2e6; border-radius: 0.5rem; background: #f8f9fa; }
  .box .label { margin: 0 0 0.25rem; font-weight: 700; }
  .box .text { margin: 0; overflow-wrap: anywhere; }
  .box img { display: block; max-width: min(100%, 320px); max-height: 260px; margin-top: 0.75rem; background: #fff; }
  .options { display: grid; gap: 0.5rem; margin-top: 0.75rem; }
  @media (min-width: 576px) { .options { grid-template-columns: 1fr 1fr; } }
  .option { min-height: 3rem; padding: 0.6rem 0.8rem; border: 1px solid #ced4da; border-radius: 0.5rem; background: #fff; color: #212529; text-align: left; cursor: pointer; }
  .option:hover:enabled { border-color: #24346c; }
  .option:disabled { cursor: default; }
  .option.correct { border-color: #198754; background: #d1e7dd; color: #0a3622; font-weight: 600; }
  .option.wrong { border-color: #dc3545; background: #f8d7da; color: #58151c; }
  .result { margin-top: 0.75rem; padding: 1rem; border: 1px solid #dee2e6; border-radius: 0.5rem; }
  .verdict { margin: 0; color: #146c43; font-weight: 700; }
  .verdict.bad { color: #b02a37; }
  .formula { overflow-x: auto; overflow-y: hidden; font-size: 1.1rem; }
  .calc { margin: 0.25rem 0 0; }
  .calc code { color: #212529; overflow-wrap: anywhere; }
  .answer { margin: 0.1rem 0 0; color: #146c43; font-weight: 600; overflow-wrap: anywhere; }
  .trap { margin: 0.5rem 0; padding: 0.5rem 0.75rem; border-left: 3px solid #e0a100; background: #fff9e6; font-size: 0.9rem; }
  .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
</style>
