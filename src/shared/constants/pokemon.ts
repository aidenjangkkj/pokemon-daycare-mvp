export const GEN_1_MIN_ID = 1;

export const GEN_1_MAX_ID = 151;

export const GEN_1_SPECIES_IDS = Array.from(
  { length: GEN_1_MAX_ID - GEN_1_MIN_ID + 1 },
  (_, index) => GEN_1_MIN_ID + index,
);
