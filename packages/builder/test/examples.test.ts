import { describe, it, expect } from 'vitest';
import { validateConfig } from 'footprint-globe';
import { EXAMPLES, getExample, listExamples } from '../src/examples';

describe('builder examples', () => {
  it('exposes three examples', () => {
    expect(listExamples()).toHaveLength(3);
  });

  it('each example has id, label, config', () => {
    for (const ex of listExamples()) {
      expect(ex.id).toBeTruthy();
      expect(ex.label).toBeTruthy();
      expect(ex.config).toBeTruthy();
    }
  });

  it('travel example is valid', () => {
    const errs = validateConfig(EXAMPLES.travel!.config);
    expect(errs).toEqual([]);
  });

  it('residence example is valid', () => {
    const errs = validateConfig(EXAMPLES.residence!.config);
    expect(errs).toEqual([]);
  });

  it('team example is valid', () => {
    const errs = validateConfig(EXAMPLES.team!.config);
    expect(errs).toEqual([]);
  });

  it('residence example has two categories', () => {
    expect(EXAMPLES.residence!.config.categories).toHaveLength(2);
  });

  it('getExample returns example by id', () => {
    expect(getExample('travel')?.label).toBe('旅行足迹');
  });
});
