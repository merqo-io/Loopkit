"use server";

// eslint-disable-next-line no-restricted-imports -- anonymous customer flow; the card or order token is the credential
import { createServiceClient } from "@/lib/supabase/server";
import {
  readCustomerProof,
  saveCustomerProof,
  customerTokenSchema,
  vendorIdSchema,
} from "@/lib/customer-proof";
import { normalizePhone } from "@/lib/phone";
import { allowAnonymousAction, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { marketingOptedIn, shownShopName } from "@/lib/marketing-consent";
import type { StatusState } from "../types";
import { buildCardStatus } from "./card-status-builder";
import {
  creditReferralHost,
  isPendingReferralCredit,
  joinPayloadSchema,
  type VendorJoinRow,
} from "./join-payload";
import { syncMarketingConsent } from "./marketing-sync";

const JOIN_FAILED_MESSAGE =
  "We could not open a card with those details. Check the number or ask the shop for help.";

type StatusInput = {
  phone: string;
  vendorId: string;
  referralCode: string;
  submittedProof: string;
};

function readStatusInput(
  formData: FormData,
): { ok: true; input: StatusInput } | { ok: false; state: StatusState } {
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Enter a valid Singapore phone number.",
      },
    };
  }

  const vendorId = String(formData.get("vendor") ?? "");
  if (!vendorIdSchema.safeParse(vendorId).success) {
    return { ok: false, state: { status: "error", message: "Missing shop." } };
  }
  const referralCode = String(formData.get("ref") ?? "").trim();
  if (referralCode.length > 100) {
    return {
      ok: false,
      state: { status: "error", message: "Invalid referral link." },
    };
  }
  const submittedProof = String(formData.get("card_code") ?? "").trim();
  if (
    submittedProof &&
    !customerTokenSchema.safeParse(submittedProof).success
  ) {
    return {
      ok: false,
      state: {
        status: "error",
        message:
          "Enter the saved code from your card, or ask the shop to recover it.",
      },
    };
  }
  return {
    ok: true,
    input: { phone: normalized.phone, vendorId, referralCode, submittedProof },
  };
}

// Existing customers must prove possession before the database returns credentials.
async function checkStatusActionImpl(
  _prev: StatusState,
  formData: FormData,
): Promise<StatusState> {
  const read = readStatusInput(formData);
  if (!read.ok) return read.state;
  const { phone, vendorId, referralCode, submittedProof } = read.input;

  if (!(await allowAnonymousAction("card-check", phone)))
    return { status: "error", message: RATE_LIMIT_MESSAGE };
  const proof = submittedProof || (await readCustomerProof(vendorId));
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("customer_join", {
    p_vendor: vendorId,
    p_phone: phone,
    p_token: proof,
    p_referral_code: referralCode || null,
  });
  // One message for every join failure, so it cannot reveal whether the phone is registered.
  if (error) return { status: "error", message: JOIN_FAILED_MESSAGE };
  const parsedPayload = joinPayloadSchema.safeParse(data);
  if (!parsedPayload.success)
    return { status: "error", message: "Could not read your card. Try again." };
  const payload = parsedPayload.data;
  const rows = payload.cards as VendorJoinRow[];
  if (rows.length === 0) {
    return { status: "none", message: "We could not find any rewards here." };
  }

  const proofToken = rows[0]!.card_token;
  await saveCustomerProof(vendorId, proofToken);
  const marketing = await syncMarketingConsent(
    { vendorId: vendorId, phone, token: proofToken },
    marketingOptedIn(formData),
    shownShopName(formData),
  );
  const pendingCredit = payload.referral_credit;
  if (isPendingReferralCredit(pendingCredit)) {
    await creditReferralHost(pendingCredit);
  }

  return {
    status: "found",
    cards: await Promise.all(rows.map(buildCardStatus)),
    phone,
    vendorAvatarUrl: rows[0]?.vendor_avatar_url ?? null,
    marketing,
  };
}

export async function checkStatusAction(
  prev: StatusState,
  formData: FormData,
): Promise<StatusState> {
  try {
    return await checkStatusActionImpl(prev, formData);
  } catch {
    return { status: "error", message: "Could not read your card. Try again." };
  }
}
