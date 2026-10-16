import { describe, it, expect } from 'vitest';
import { parseCsv } from '../../src/data/csv';
import { csvBadCategory, csvBasic, csvMissingColumns, csvOutOfRange } from '../fixtures/config-csv';

describe('parseCsv', () => {
  it('parses a valid CSV', () => {
    const r = parseCsv(csvBasic);
    expect(r.warnings).toEqual([]);
    const ids = r.config.categories.map((c) => c.id).sort();
    expect(ids).toEqual(['residence', 'travel']);
    const residence = r.config.categories.find((c) => c.id === 'residence')!;
    expect(residence.pins).toHaveLength(1);
    expect(residence.pins[0]!.photos).toEqual(['https://a.jpg', 'https://b.jpg']);
    const travel = r.config.categories.find((c) => c.id === 'travel')!;
    expect(travel.pins).toHaveLength(2);
  });

  it('throws on missing required columns', () => {
    expect(() => parseCsv(csvMissingColumns)).toThrow(/name.*lng.*lat/);
  });

  it('throws on empty input', () => {
    expect(() => parseCsv('')).toThrow(/空/);
  });

  it('skips out-of-range coordinates and warns', () => {
    const r = parseCsv(csvOutOfRange);
    const total = r.config.categories.reduce((s, c) => s + c.pins.length, 0);
    expect(total).toBe(1);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.warnings[0]).toMatch(/经度越界/);
  });

  it('falls back bad category to default with warning', () => {
    const r = parseCsv(csvBadCategory);
    expect(r.config.categories[0]!.id).toBe('default');
    expect(r.warnings.some((w) => w.includes('分类不合法'))).toBe(true);
  });

  it('handles quoted fields with commas', () => {
    const csv = `name,lng,lat\n"东京, 日本",139.759,35.682\n`;
    const r = parseCsv(csv);
    expect(r.config.categories[0]!.pins[0]!.name).toBe('东京, 日本');
  });

  it('truncates > MAX_PINS rows', () => {
    const header = 'name,lng,lat\n';
    const rows = Array.from({ length: 1200 }, (_, i) => `p${i},0,0`).join('\n');
    const r = parseCsv(header + rows);
    const total = r.config.categories.reduce((s, c) => s + c.pins.length, 0);
    expect(total).toBe(1000);
    expect(r.warnings.some((w) => w.includes('截断'))).toBe(true);
  });

  it('throws when file exceeds 1MB', () => {
    const huge = 'name,lng,lat\n' + 'x'.repeat(1024 * 1024 + 1);
    expect(() => parseCsv(huge)).toThrow(/1MB/);
  });

  it('throws on empty input with only blank lines', () => {
    expect(() => parseCsv('\n\n  \n')).toThrow(/空/);
  });

  it('skips rows without a name', () => {
    const csv = 'name,lng,lat\n,139.759,35.682\n东京,139.759,35.682\n';
    const r = parseCsv(csv);
    const total = r.config.categories.reduce((s, c) => s + c.pins.length, 0);
    expect(total).toBe(1);
    expect(r.warnings.some((w) => w.includes('缺少 name'))).toBe(true);
  });

  it('warns and keeps missing-category rows in default', () => {
    const csv = 'name,lng,lat\n东京,139.759,35.682\n';
    const r = parseCsv(csv);
    expect(r.config.categories[0]!.id).toBe('default');
  });

  it('parses optional date / note fields', () => {
    const csv = 'date,note,name,lat,lng\n2019-04,赏樱,东京,35.682,139.759\n';
    const r = parseCsv(csv);
    const pin = r.config.categories[0]!.pins[0]!;
    expect(pin.date).toBe('2019-04');
    expect(pin.note).toBe('赏樱');
  });

  it('handles escaped double quotes inside quoted field', () => {
    const csv = 'name,lng,lat\n"他说""你好""",139.759,35.682\n';
    const r = parseCsv(csv);
    expect(r.config.categories[0]!.pins[0]!.name).toBe('他说"你好"');
  });
});
