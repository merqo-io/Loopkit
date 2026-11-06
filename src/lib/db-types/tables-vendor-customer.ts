import type {
  EntitlementStatsWindow,
  EntitlementTier,
  MarketingConsentSource,
} from "./common";

// Vendor, qkit earn, customer, consent, referral and legal tables.
export type VendorCustomerTables = {
  vendor_entitlements: {
    Row: {
      vendor_id: string;
      tier: EntitlementTier;
      founder: boolean;
      stats_window: EntitlementStatsWindow;
      valid_until: string | null;
      issued_at: string;
      updated_at: string;
    };
    Insert: {
      vendor_id: string;
      tier: EntitlementTier;
      founder?: boolean;
      stats_window?: EntitlementStatsWindow;
      valid_until?: string | null;
      issued_at: string;
      updated_at?: string;
    };
    Update: {
      vendor_id?: string;
      tier?: EntitlementTier;
      founder?: boolean;
      stats_window?: EntitlementStatsWindow;
      valid_until?: string | null;
      issued_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  vendors: {
    Row: {
      vendor_id: string;
      name: string | null;
      phone: string | null;
      tour_seen_at: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      vendor_id: string;
      name?: string | null;
      phone?: string | null;
      tour_seen_at?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      vendor_id?: string;
      name?: string | null;
      phone?: string | null;
      tour_seen_at?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  qkit_earn_config: {
    Row: {
      vendor_id: string;
      program_id: string;
      enabled: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      vendor_id: string;
      program_id: string;
      enabled?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      vendor_id?: string;
      program_id?: string;
      enabled?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  qkit_earn_events: {
    Row: {
      order_id: string;
      vendor_id: string;
      card_id: string;
      created_at: string;
    };
    Insert: {
      order_id: string;
      vendor_id: string;
      card_id: string;
      created_at?: string;
    };
    Update: {
      order_id?: string;
      vendor_id?: string;
      card_id?: string;
      created_at?: string;
    };
    Relationships: [];
  };
  customers: {
    Row: {
      vendor_id: string;
      phone: string;
      name: string | null;
      first_seen_at: string;
      last_seen_at: string;
      birth_month: number | null;
      birth_day: number | null;
      last_birthday_reward_year: number | null;
    };
    Insert: {
      vendor_id: string;
      phone: string;
      name?: string | null;
      first_seen_at?: string;
      last_seen_at?: string;
      birth_month?: number | null;
      birth_day?: number | null;
      last_birthday_reward_year?: number | null;
    };
    Update: {
      vendor_id?: string;
      phone?: string;
      name?: string | null;
      first_seen_at?: string;
      last_seen_at?: string;
      birth_month?: number | null;
      birth_day?: number | null;
      last_birthday_reward_year?: number | null;
    };
    Relationships: [];
  };
  feedback: {
    Row: {
      id: number;
      vendor_id: string;
      nps: number;
      message: string | null;
      created_at: string;
    };
    Insert: {
      id?: number;
      vendor_id: string;
      nps: number;
      message?: string | null;
      created_at?: string;
    };
    Update: {
      id?: number;
      vendor_id?: string;
      nps?: number;
      message?: string | null;
      created_at?: string;
    };
    Relationships: [];
  };
  marketing_consents: {
    Row: {
      id: number;
      vendor_id: string;
      phone: string;
      granted: boolean;
      wording_version: string | null;
      wording_text: string | null;
      source: MarketingConsentSource;
      recorded_at: string;
    };
    Insert: {
      vendor_id: string;
      phone: string;
      granted: boolean;
      wording_version?: string | null;
      wording_text?: string | null;
      source: MarketingConsentSource;
      recorded_at?: string;
    };
    Update: {
      vendor_id?: string;
      phone?: string;
      granted?: boolean;
      wording_version?: string | null;
      wording_text?: string | null;
      source?: MarketingConsentSource;
      recorded_at?: string;
    };
    Relationships: [];
  };
  vendor_notify_settings: {
    Row: {
      vendor_id: string;
      customer_telegram_notify_enabled: boolean;
      updated_at: string;
    };
    Insert: {
      vendor_id: string;
      customer_telegram_notify_enabled?: boolean;
      updated_at?: string;
    };
    Update: {
      vendor_id?: string;
      customer_telegram_notify_enabled?: boolean;
      updated_at?: string;
    };
    Relationships: [];
  };
  referral_hosts: {
    Row: {
      id: string;
      vendor_id: string;
      program_id: string;
      host_phone: string;
      label: string | null;
      referral_code: string;
      guest_count: number;
      created_at: string;
    };
    Insert: {
      id?: string;
      vendor_id: string;
      program_id: string;
      host_phone: string;
      label?: string | null;
      referral_code?: string;
      guest_count?: number;
      created_at?: string;
    };
    Update: {
      id?: string;
      vendor_id?: string;
      program_id?: string;
      host_phone?: string;
      label?: string | null;
      referral_code?: string;
      guest_count?: number;
      created_at?: string;
    };
    Relationships: [];
  };
  referral_credits: {
    Row: {
      id: string;
      referral_host_id: string;
      guest_phone: string;
      credited_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      referral_host_id: string;
      guest_phone: string;
      credited_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      referral_host_id?: string;
      guest_phone?: string;
      credited_at?: string | null;
      created_at?: string;
    };
    Relationships: [];
  };
  legal_check_state: {
    Row: {
      email: string;
      checked_at: string;
      is_current: boolean;
    };
    Insert: {
      email: string;
      checked_at?: string;
      is_current: boolean;
    };
    Update: {
      email?: string;
      checked_at?: string;
      is_current?: boolean;
    };
    Relationships: [];
  };
};
