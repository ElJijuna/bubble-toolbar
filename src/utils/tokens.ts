import type { CSSProperties } from 'react';

export type TokenUnit = 'px' | 'ms' | '';
export type TokenMap<K extends string> = Record<K, readonly [cssVar: string, unit: TokenUnit]>;

/**
 * Builds a converter from typed tokens to CSS custom properties.
 * Numbers get the token's unit; unknown, inherited and empty keys are ignored.
 */
export const createTokenStyle =
  <K extends string>(map: TokenMap<K>) =>
  (tokens: Partial<Record<K, number | string>> | undefined): CSSProperties => {
    const style: Record<string, string> = {};
    if (!tokens) {
      return style;
    }
    for (const [key, value] of Object.entries(tokens)) {
      if (!Object.hasOwn(map, key) || value === undefined || value === null) {
        continue;
      }
      const [name, unit] = map[key as K];
      style[name] = typeof value === 'number' && unit ? `${value}${unit}` : String(value);
    }
    return style;
  };
