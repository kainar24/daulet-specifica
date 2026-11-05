import { describe, expect, it } from 'vitest';
import { CARDS, evalCalc, labelsOf } from '../src/lib/cards';
import problems from '../src/lib/problems.json';

describe('formula cards', () => {
  const printed = new Map(problems.map((p) => [p.label, p.answer]));

  it('cover every problem exactly once', () => {
    const labels = CARDS.flatMap(labelsOf);
    const expected = Array.from({ length: 150 }, (_, i) => `P${i + 1}`);
    expect([...labels].sort()).toEqual([...expected].sort());
  });

  it('reproduce every printed answer within 0.5%', () => {
    const bad: string[] = [];
    for (const card of CARDS)
      for (const row of card.rows)
        for (const [label, line] of row.items) {
          const want = printed.get(label)!;
          const got = evalCalc(line);
          if (Math.abs(got - want) > Math.abs(want) * 0.005) bad.push(`${label}: got ${got}, printed ${want} (${line})`);
        }
    expect(bad).toEqual([]);
  });
});
