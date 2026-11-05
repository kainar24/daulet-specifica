import { defaultConfig } from '@pt/quiz';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { app } from '$lib/app.svelte';
import { type Card, labelsOf } from '$lib/cards';
import problems from '$lib/problems.json';

export const SET_ID = 'phys161-exam4';
const LEARNED_KEY = 'daulet.learned';

export interface Problem {
  label: string;
  text: string;
  answer: number;
  unit: string;
  fig?: string;
}

export const PROBLEMS = new Map<string, Problem>((problems as Problem[]).map((p) => [p.label, p]));

/** Which cards the viewer marked as learned, remembered in this browser. */
class Learned {
  ids = $state<Record<string, boolean>>(read());

  toggle(id: string): void {
    this.ids = { ...this.ids, [id]: !this.ids[id] };
    try {
      localStorage.setItem(LEARNED_KEY, JSON.stringify(this.ids));
    } catch {
      // The mark lasts for this visit only.
    }
  }

  get count(): number {
    return Object.values(this.ids).filter(Boolean).length;
  }
}

function read(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(LEARNED_KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

export const learned = new Learned();

/** Practice a card's problems with fresh numbers, in the regular attempt screen. */
export function practice(card: Card): void {
  if (app.attempt && !confirm('Текущая попытка будет брошена. Начать новую?')) return;
  const keep = new Set(labelsOf(card));
  const all = app.sets[SET_ID]?.questions ?? [];
  const config = {
    ...defaultConfig([SET_ID], 'ordered'),
    exclude: { [SET_ID]: all.filter((q) => !keep.has(q.label)).map((q) => q.label) },
  };
  const r = app.start(config);
  if (!r.ok) {
    alert(r.message);
    return;
  }
  // app.start remembers its config: the start page must stay on the full exam.
  try {
    app.storage.savePrefs({ config: defaultConfig([SET_ID], 'exam') });
  } catch {
    // Preferences are a convenience.
  }
  void goto(resolve('/attempt/'));
}

/** The document's answer, short enough to read. */
export function formatAnswer(p: Problem): string {
  const a = p.answer;
  const abs = Math.abs(a);
  const text = abs !== 0 && (abs >= 1e7 || abs < 1e-3) ? a.toExponential(4) : String(Number(a.toPrecision(6)));
  return p.unit ? `${text} ${p.unit}` : text;
}
