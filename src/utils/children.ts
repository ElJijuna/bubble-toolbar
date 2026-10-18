import type { ReactNode } from 'react';
import { Children, Fragment, isValidElement } from 'react';

/**
 * Returns an array of non-null, non-undefined, non-boolean child elements.
 * Unpacks Fragment if encountered at the top level.
 */
export function getValidChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return;
    }

    if (isValidElement(child) && child.type === Fragment) {
      const fragmentChildren = getValidChildren((child.props as { children?: ReactNode }).children);
      result.push(...fragmentChildren);
    } else {
      result.push(child);
    }
  });

  return result;
}
