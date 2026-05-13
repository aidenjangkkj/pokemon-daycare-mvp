import {
  ACTION_ITEM_MODIFIER_MAP,
  CONSECUTIVE_ACTION_PENALTY_MULTIPLIER,
  NATURE_ACTION_MODIFIER_MAP,
  STAGE_EFFICIENCY_MAP,
  TYPE_ACTION_MODIFIER_MAP,
} from "./action.modifier";
import type {
  ActionDelta,
  ActionModifierContext,
} from "./action.types";

function mergeDelta(
  base: ActionDelta,
  extra: ActionDelta,
): ActionDelta {
  return {
    hunger: (base.hunger ?? 0) + (extra.hunger ?? 0),
    cleanliness:
      (base.cleanliness ?? 0) + (extra.cleanliness ?? 0),
    mood: (base.mood ?? 0) + (extra.mood ?? 0),
    energy: (base.energy ?? 0) + (extra.energy ?? 0),
  };
}

function applyScale(delta: ActionDelta, scale: number): ActionDelta {
  return {
    hunger: Math.round((delta.hunger ?? 0) * scale),
    cleanliness: Math.round((delta.cleanliness ?? 0) * scale),
    mood: Math.round((delta.mood ?? 0) * scale),
    energy: Math.round((delta.energy ?? 0) * scale),
  };
}

export function getConsecutiveActionMultiplier(
  consecutiveCount: number,
): number {
  return consecutiveCount >= 2
    ? CONSECUTIVE_ACTION_PENALTY_MULTIPLIER
    : 1;
}

export function applyActionModifiers(
  baseDelta: ActionDelta,
  context: ActionModifierContext,
): ActionDelta {
  let nextDelta = { ...baseDelta };

  const stageScale = STAGE_EFFICIENCY_MAP[context.pet.stage];
  nextDelta = applyScale(nextDelta, stageScale);

  for (const type of context.pet.types ?? []) {
    const typeModifier = TYPE_ACTION_MODIFIER_MAP[type]?.[context.action];

    if (typeModifier) {
      nextDelta = mergeDelta(nextDelta, typeModifier);
    }
  }

  const natureModifier =
    NATURE_ACTION_MODIFIER_MAP[context.pet.natureDisposition]?.[
      context.action
    ];

  if (natureModifier) {
    nextDelta = mergeDelta(nextDelta, natureModifier);
  }

  const itemModifier = ACTION_ITEM_MODIFIER_MAP[context.action];

  if (itemModifier) {
    nextDelta = mergeDelta(nextDelta, itemModifier);
  }

  const consecutiveMultiplier = getConsecutiveActionMultiplier(
    context.consecutiveCount,
  );

  nextDelta = applyScale(nextDelta, consecutiveMultiplier);

  return nextDelta;
}
