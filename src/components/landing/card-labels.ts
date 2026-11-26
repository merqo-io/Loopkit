// Strings the landing mock-ups share with the product. card-labels.test.ts
// pins each one to the source file it was copied from, so the landing cannot
// drift from what a vendor or customer actually sees.
export const CARD_TOTAL = 8;
export const SHOP_NAME = "Kaya Toast Co.";
export const SAMPLE_PHONE = "9123 4567";
export const REWARD_TEXT = "free kopi";

export const JOIN_NOTE = "New here? Enter your phone to join, no app needed.";
export const CHECK_BUTTON = "Check my card";
export const STAMP_BUTTON = "Create card and first stamp";
export const REDEEM_BUTTON = "Redeem";
export const REWARD_READY = "Reward ready!";
export const REWARD_REDEEMED = "Reward redeemed";

export const stampsLine = (n: number) => `${n} / ${CARD_TOTAL} stamps`;
export const rewardLine = `Reward: ${REWARD_TEXT}`;
export const cardCreatedNote = `Card created for ${SAMPLE_PHONE}, first stamp added.`;
export const redeemedNote = `Reward redeemed for ${SAMPLE_PHONE}.`;
