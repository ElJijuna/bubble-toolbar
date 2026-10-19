import { useContext, useState } from 'react';
import { BubbleToolbarContext } from '../context';
import type { BubbleLiveActivityController, BubbleLiveActivityOptions } from '../types';
import type { LiveControllerInternals } from './controller';
import { createLiveController } from './controller';

/**
 * Creates a stable Live Activity controller. Pass it to `<BubbleToolbar liveActivity>` and call
 * `run`, `show` or `dismiss` from anywhere. Options are read on every render.
 */
export const useBubbleLiveActivity = (
  options: BubbleLiveActivityOptions = {},
): BubbleLiveActivityController => {
  const [controller] = useState(() => createLiveController(options));
  controller.options = options;
  return controller;
};

/** Reads the controller of the surrounding BubbleToolbar. */
export const useBubbleToolbarLiveActivity = (): BubbleLiveActivityController => {
  const controller = useContext(BubbleToolbarContext).liveActivity;
  if (!controller) {
    throw new Error(
      'useBubbleToolbarLiveActivity must be used inside a <BubbleToolbar liveActivity={…}>.',
    );
  }
  return controller;
};

export const asInternals = (controller: BubbleLiveActivityController) =>
  controller as LiveControllerInternals;
