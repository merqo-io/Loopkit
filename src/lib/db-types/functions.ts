import type { Json, MarketingConsentSource } from "./common";
import type { Database } from "./database";

// RPC signatures exposed by the loopkit schema.
export type DatabaseFunctions = {
  customer_set_marketing_consent: {
    Args: {
      p_vendor: string;
      p_phone: string;
      p_token: string;
      p_granted: boolean;
      p_wording_version: string;
      p_wording_text: string;
      p_source: Exclude<MarketingConsentSource, "vendor_recorded">;
    };
    Returns: boolean;
  };
  customer_marketing_consent: {
    Args: { p_vendor: string; p_phone: string; p_token: string };
    Returns: boolean;
  };
  vendor_withdraw_marketing_consent: {
    Args: { p_phone: string };
    Returns: void;
  };
  owns_program: {
    Args: { p_program: string };
    Returns: boolean;
  };
  set_customer_birthday: {
    Args: {
      p_vendor: string;
      p_phone: string;
      p_birth_month: number;
      p_birth_day: number;
    };
    Returns: void;
  };
  add_stamp: {
    Args: { p_program: string; p_phone: string };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  adjust_stamp: {
    Args: {
      p_program: string;
      p_phone: string;
      p_delta: number;
      p_reason: string;
    };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  redeem: {
    Args: { p_card: string };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  redeem_plant: {
    Args: { p_program: string; p_phone: string };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  record_visit_checked: {
    Args: {
      p_program: string;
      p_phone: string;
      p_state: Json;
      p_kind: string;
      p_payload: Json;
      p_expected_updated_at: string | null;
    };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  record_visit: {
    Args: {
      p_program: string;
      p_phone: string;
      p_state: Json;
      p_kind: string;
      p_payload: Json;
    };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  create_program: {
    Args: {
      p_type: string;
      p_name: string;
      p_stamps_required: number;
      p_reward_text: string;
      p_config: Json;
      p_expiry_days?: number | null;
      p_head_start?: boolean;
      p_carry_over_stamps?: boolean;
      p_active?: boolean;
      p_head_start_percent?: number;
      p_reward_expiry_days?: number | null;
    };
    Returns: string;
  };
  replace_program: {
    Args: {
      p_replacing: string;
      p_type: string;
      p_name: string;
      p_stamps_required: number;
      p_reward_text: string;
      p_config: Json;
      p_expiry_days?: number | null;
      p_head_start?: boolean;
      p_carry_over_stamps?: boolean;
      p_head_start_percent?: number;
      p_reward_expiry_days?: number | null;
    };
    Returns: string;
  };
  provision_default_program: {
    Args: { p_vendor_id: string };
    Returns: string;
  };
  activate_program: {
    Args: { p_program: string };
    Returns: Database["loopkit"]["Tables"]["programs"]["Row"];
  };
  schedule_retirement: {
    Args: {
      p_program: string;
      p_successor: string;
      p_date: string;
    };
    Returns: Database["loopkit"]["Tables"]["programs"]["Row"];
  };
  enroll_card: {
    Args: { p_program: string; p_phone: string };
    Returns: string;
  };
  card_view: {
    Args: { p_program: string; p_phone: string };
    Returns: {
      name: string;
      type: string;
      config: Json;
      state: Json;
      stamp_count: number;
      card_token: string;
      reward_text: string;
      stamps_required: number;
      expiry_days: number | null;
      cycle_started_at: string | null;
    }[];
  };
  vendor_active_programs: {
    Args: {
      p_vendor: string;
    };
    Returns: {
      id: string;
      name: string;
      type: string;
      reward_text: string;
    }[];
  };
  vendor_join: {
    Args: {
      p_vendor: string;
      p_phone: string;
    };
    Returns: {
      program_id: string;
      name: string;
      type: string;
      config: Json;
      state: Json;
      stamp_count: number;
      card_token: string;
      reward_text: string;
      stamps_required: number;
      expiry_days: number | null;
      cycle_started_at: string | null;
      active: boolean;
      replaced_by_name: string | null;
      replaced_by_stamp_count: number | null;
      voucher_expires_at: string | null;
      vendor_avatar_url: string | null;
      active_vouchers: Json;
    }[];
  };
  vendor_join_referred: {
    Args: {
      p_vendor: string;
      p_phone: string;
      p_referral_code: string;
    };
    Returns: {
      program_id: string;
      name: string;
      type: string;
      config: Json;
      state: Json;
      stamp_count: number;
      card_token: string;
      reward_text: string;
      stamps_required: number;
      expiry_days: number | null;
      cycle_started_at: string | null;
      active: boolean;
      replaced_by_name: string | null;
      replaced_by_stamp_count: number | null;
      voucher_expires_at: string | null;
      vendor_avatar_url: string | null;
      referral_credit: Json | null;
    }[];
  };
  upsert_vendor_entitlement: {
    Args: {
      p_vendor_id: string;
      p_tier: string;
      p_founder: boolean;
      p_stats_window: string;
      p_valid_until: string | null;
      p_issued_at: string;
    };
    Returns: undefined;
  };
  check_rate_limit: {
    Args: { p_key: string; p_limit: number; p_window_seconds: number };
    Returns: boolean;
  };
  referral_credit_snapshot: {
    Args: { p_referral_host_id: string; p_guest_phone: string };
    Returns: Json;
  };
  apply_referral_credit_checked: {
    Args: {
      p_referral_host_id: string;
      p_guest_phone: string;
      p_expected: Json;
      p_state: Json;
      p_payload: Json;
    };
    Returns: boolean;
  };
  apply_referral_credit: {
    Args: {
      p_referral_host_id: string;
      p_guest_phone: string;
      p_state: Json;
      p_kind: string;
      p_payload: Json;
    };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  card_by_token: {
    Args: { p_token: string };
    Returns: {
      program_id: string;
      card_id: string;
      phone: string;
    }[];
  };
  customer_join: {
    Args: {
      p_vendor: string;
      p_phone: string;
      p_token?: string | null;
      p_referral_code?: string | null;
    };
    Returns: Json;
  };
  customer_select_points_reward: {
    Args: {
      p_vendor: string;
      p_program: string;
      p_phone: string;
      p_token: string;
      p_item_id: string;
    };
    Returns: Database["loopkit"]["Tables"]["reward_vouchers"]["Row"];
  };
  customer_erase: {
    Args: { p_vendor: string; p_phone: string; p_token: string };
    Returns: boolean;
  };
  customer_set_birthday: {
    Args: {
      p_vendor: string;
      p_phone: string;
      p_token: string;
      p_month: number;
      p_day: number;
    };
    Returns: void;
  };
  customer_reset_expired_card: {
    Args: {
      p_vendor: string;
      p_program: string;
      p_phone: string;
      p_token: string;
    };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  recover_customer_card: {
    Args: { p_program: string; p_phone: string };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  regenerate_card: {
    Args: { p_program: string; p_phone: string };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  is_admin: {
    Args: { p_uid: string };
    Returns: boolean;
  };
  is_pro: {
    Args: { p_uid: string };
    Returns: boolean;
  };
  qkit_earn_vendor: {
    Args: { p_order_id: string };
    Returns: string | null;
  };
  customer_qkit_earn_claim: {
    Args: {
      p_order_id: string;
      p_phone: string;
      p_name: string | null;
      p_token?: string | null;
    };
    Returns: Json;
  };
  qkit_earn_lookup: {
    Args: { p_order_id: string; p_phone: string };
    Returns: {
      vendor_id: string;
      program_id: string;
      program_type: string;
      program_config: Json;
      stamps_required: number;
      reward_text: string;
      already_claimed: boolean;
      card_state: Json;
      card_stamp_count: number;
      card_reward_count: number;
    }[];
  };
  // Compatibility arguments remain in the RPC; SQL derives stamps and state.
  qkit_earn_commit: {
    Args: {
      p_order_id: string;
      p_phone: string;
      p_name: string | null;
      p_stamp_count: number;
      p_state: Json;
    };
    Returns: Database["loopkit"]["Tables"]["cards"]["Row"];
  };
  _expire_stale_vouchers_unchecked: {
    Args: { p_card: string };
    Returns: number;
  };
  expire_stale_vouchers: {
    Args: { p_card: string };
    Returns: number;
  };
  _grant_reward_voucher_unchecked: {
    Args: {
      p_card: string;
      p_reward_text: string;
      p_expiry_days: number | null;
      p_count?: number;
      p_immediate?: boolean;
    };
    Returns: void;
  };
  grant_reward_voucher: {
    Args: {
      p_card: string;
      p_reward_text: string;
      p_expiry_days: number | null;
      p_count?: number;
      p_immediate?: boolean;
    };
    Returns: void;
  };
  redeem_oldest_voucher: {
    Args: { p_card: string };
    Returns: void;
  };
  voucher_by_token: {
    Args: { p_token: string };
    Returns: {
      program_id: string;
      card_id: string;
      voucher_id: string;
      phone: string;
      reward_text: string;
      status: string;
    }[];
  };
  redeem_voucher_by_token: {
    Args: { p_token: string };
    Returns: Database["loopkit"]["Tables"]["reward_vouchers"]["Row"];
  };
  select_points_reward: {
    Args: { p_program: string; p_phone: string; p_item_id: string };
    Returns: Database["loopkit"]["Tables"]["reward_vouchers"]["Row"];
  };
  apply_points_offset: {
    Args: { p_card: string; p_points: number };
    Returns: {
      id: string;
      phone: string;
      stamp_count: number;
      dollars: number;
    }[];
  };
};
