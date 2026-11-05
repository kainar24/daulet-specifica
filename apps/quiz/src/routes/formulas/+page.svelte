<script lang="ts">
  import { renderTex } from '@pt/ui';
  import Page from '$lib/components/Page.svelte';
  import { CARDS, CARDS_BY_VALUE, type Card, labelsOf, prettyCalc, problemCount, SECTIONS } from '$lib/cards';
  import { formatAnswer, learned, practice, PROBLEMS } from '$lib/study.svelte';

  let query = $state('');
  let section = $state<number | null>(null);
  let hide = $state(false);
  let shown = $state<Record<string, boolean>>({});

  const searchable = new Map(
    CARDS.map((c) => [
      c.id,
      [c.title, ...c.keys, ...labelsOf(c).map((l) => PROBLEMS.get(l)?.text ?? '')].join(' ').toLowerCase(),
    ]),
  );

  function matches(c: Card, q: string): boolean {
    const n = /^p?(\d{1,3})$/.exec(q);
    if (n) return labelsOf(c).includes(`P${n[1]}`);
    return searchable.get(c.id)!.includes(q);
  }

  const q = $derived(query.trim().toLowerCase());
  const list = $derived(CARDS_BY_VALUE.filter((c) => (section === null || c.section === section) && (!q || matches(c, q))));
  const top10 = CARDS_BY_VALUE.slice(0, 10).reduce((n, c) => n + problemCount(c), 0);
  const rankOf = new Map(CARDS_BY_VALUE.map((c, i) => [c.id, i + 1]));

  function setHide(on: boolean): void {
    hide = on;
    shown = {};
  }
</script>

<svelte:head><title>Формулы · daulet-specifica</title></svelte:head>

<Page narrow>
  <div class="page-header"><h1>Формулы</h1></div>
  <p class="lead">
    {CARDS.length} карточек закрывают все 150 задач. Сверху самые выгодные: первые 10 дают {top10} задач.
    Числа на экзамене могут быть другими, поэтому учи формулу, а не ответ.
  </p>

  <div class="tools">
    <input class="form-control search" type="search" placeholder="Слово из условия или номер: stopcock, P36" aria-label="Поиск" bind:value={query} />
    <div class="chips" role="group" aria-label="Раздел">
      <button type="button" class="chip" aria-pressed={section === null} onclick={() => (section = null)}>Все</button>
      {#each SECTIONS as name, i (name)}
        <button type="button" class="chip" aria-pressed={section === i} onclick={() => (section = i)}>{name}</button>
      {/each}
    </div>
    <div class="row">
      <label><input type="checkbox" checked={hide} onchange={(e) => setHide(e.currentTarget.checked)} /> Спрятать формулы и проверить себя</label>
      <span class="progress-text">Выучено {learned.count} из {CARDS.length}</span>
    </div>
  </div>

  {#if list.length === 0}
    <p class="muted">Ничего не нашлось. Попробуй другое слово из условия.</p>
  {/if}

  {#each list as card (card.id)}
    <article class="card" id={card.id} class:done={learned.ids[card.id]}>
      <header>
        <span class="rank">{rankOf.get(card.id)}</span>
        <h2>{card.title}</h2>
        <span class="count">{problemCount(card)} {problemCount(card) === 1 ? 'задача' : problemCount(card) < 5 ? 'задачи' : 'задач'}</span>
      </header>

      {#if hide && !shown[card.id]}
        <button type="button" class="reveal" onclick={() => (shown[card.id] = true)}>Вспомни формулу и нажми</button>
      {:else}
        <div class="formula">{@html renderTex(card.tex, true)}</div>
      {/if}

      <p class="keys-title">Узнаёшь по словам:</p>
      <ul class="keys">{#each card.keys as key (key)}<li>{key}</li>{/each}</ul>
      {#if card.trap}<p class="trap"><b>Ловушка.</b> {card.trap}</p>{/if}

      <details open={q !== ''}>
        <summary>Все задачи этой карточки</summary>
        {#each card.rows as row (row.q)}
          <div class="variant">
            <h3>{row.q}</h3>
            <div class="formula small">{@html renderTex(row.tex, true)}</div>
            {#each row.items as [label, line] (label)}
              {@const p = PROBLEMS.get(label)}
              <div class="calc">
                <span class="label">{label}</span>
                <code>{prettyCalc(line)}</code>
                <span class="answer">= {p ? formatAnswer(p) : ''}</span>
              </div>
            {/each}
          </div>
        {/each}
      </details>

      <div class="actions">
        <button type="button" class="btn btn-primary" onclick={() => practice(card)}>Решать с новыми числами</button>
        <label class="learned"><input type="checkbox" checked={learned.ids[card.id] ?? false} onchange={() => learned.toggle(card.id)} /> Выучил</label>
      </div>
    </article>
  {/each}
</Page>

<style>
  .lead { color: #495057; }
  .tools { display: grid; gap: 0.75rem; margin-bottom: 1.25rem; }
  .search { width: 100%; max-width: none; }
  .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .chip { padding: 0.35rem 0.8rem; border: 1px solid #ced4da; border-radius: 999px; background: #fff; color: #212529; cursor: pointer; }
  .chip[aria-pressed='true'] { border-color: #24346c; background: #24346c; color: #fff; }
  .row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; }
  .progress-text { color: #495057; font-weight: 600; }
  .card { margin-bottom: 1rem; padding: 1rem; border: 1px solid #dee2e6; border-radius: 0.5rem; background: #fff; scroll-margin-top: 76px; }
  .card.done { border-color: #198754; background: #f4fbf7; }
  .card header { display: flex; align-items: center; gap: 0.6rem; }
  .card h2 { flex: 1; margin: 0; font-size: 1.15rem; }
  .rank { display: inline-grid; flex: none; place-items: center; width: 1.8rem; height: 1.8rem; border-radius: 50%; background: #24346c; color: #fff; font-size: 0.85rem; font-weight: 700; }
  .count { flex: none; color: #495057; font-size: 0.875rem; white-space: nowrap; }
  .formula { overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; font-size: 1.15rem; }
  .formula.small { font-size: 1rem; }
  .reveal { width: 100%; margin: 0.75rem 0; padding: 1.2rem; border: 1px dashed #868e96; border-radius: 0.5rem; background: #f8f9fa; color: #24346c; font-weight: 600; cursor: pointer; }
  .keys-title { margin: 0.5rem 0 0.25rem; font-size: 0.9rem; font-weight: 700; }
  .keys { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0 0 0.5rem; padding: 0; list-style: none; font-size: 0.85rem; }
  .keys li { padding: 0.05rem 0.4rem; border-radius: 0.25rem; background: #eef1f8; color: #24346c; overflow-wrap: anywhere; }
  .trap { margin: 0.5rem 0; padding: 0.5rem 0.75rem; border-left: 3px solid #e0a100; background: #fff9e6; font-size: 0.9rem; }
  details { margin: 0.5rem 0; }
  summary { color: #0f6cbf; cursor: pointer; }
  .variant { margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid #e9ecef; }
  .variant h3 { margin: 0; font-size: 0.95rem; }
  .calc { display: grid; grid-template-columns: 3.2rem minmax(0, 1fr); gap: 0.1rem 0.5rem; margin-top: 0.35rem; font-size: 0.875rem; }
  .calc .label { font-weight: 700; }
  .calc code { overflow-wrap: anywhere; color: #212529; }
  .calc .answer { grid-column: 2; color: #146c43; font-weight: 600; overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-top: 0.75rem; }
</style>
