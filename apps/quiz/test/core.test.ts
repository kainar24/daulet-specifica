import { describe, expect, it } from 'vitest';
import { CARDS, evalCalc } from '../src/lib/cards';
import { CORE_FLAT, LOOKUP } from '../src/lib/core';
import problems from '../src/lib/problems.json';

describe('core formulas', () => {
  const printed = new Map(problems.map((p) => [p.label, p.answer]));
  const cardIds = new Set(CARDS.map((c) => c.id));
  const coreIds = new Set(CORE_FLAT.map((f) => f.id));

  it('solve every example to the printed answer within 0.5%', () => {
    const bad: string[] = [];
    for (const f of CORE_FLAT) {
      if (!f.example) continue;
      const want = printed.get(f.example.label)!;
      const got = evalCalc(f.example.calc);
      if (Math.abs(got - want) > Math.abs(want) * 0.005) bad.push(`${f.id} ${f.example.label}: got ${got}, printed ${want}`);
    }
    expect(bad).toEqual([]);
  });

  it('link only to cards and formulas that exist', () => {
    expect(coreIds.size).toBe(CORE_FLAT.length);
    expect(CORE_FLAT.flatMap((f) => f.cards).filter((id) => !cardIds.has(id))).toEqual([]);
    expect(LOOKUP.flatMap(([, ids]) => ids).filter((id) => !coreIds.has(id))).toEqual([]);
  });
});
