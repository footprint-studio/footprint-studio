/**
 * 足迹地球 · Builder 示例模板
 * 契约依据：《Sprint 3 执行方案》§8 S3-9
 */

import type { FootprintConfig } from 'footprint-globe';
import { travel } from './travel';
import { residence } from './residence';
import { team } from './team';

export type ExampleId = 'travel' | 'residence' | 'team';

export interface Example {
  id: ExampleId;
  label: string;
  description: string;
  config: FootprintConfig;
}

export const EXAMPLES: Record<ExampleId, Example> = {
  travel: {
    id: 'travel',
    label: '旅行足迹',
    description: '单一分类，快速体验',
    config: travel,
  },
  residence: {
    id: 'residence',
    label: '居住 + 旅行',
    description: '双分类演示',
    config: residence,
  },
  team: {
    id: 'team',
    label: '团队分布',
    description: '全球团队场景',
    config: team,
  },
};

export function getExample(id: ExampleId): Example | undefined {
  return EXAMPLES[id];
}

export function listExamples(): Example[] {
  return Object.values(EXAMPLES);
}
