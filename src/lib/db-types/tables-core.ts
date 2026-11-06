import type { Json } from "./common";

// Program, card, stamp, voucher and admin tables.
export type CoreTables = {
  programs: {
    Row: {
      id: string;
      vendor_id: string;
      name: string;
      stamps_required: number;
      reward_text: string;
      type: string;
      config: Json;
      active: boolean;
      expiry_days: number | null;
      reward_expiry_days: number | null;
      reward_cost_cents: number | null;
      head_start: boolean;
      replaced_by: string | null;
      carry_over_stamps: boolean;
      head_start_percent: number;
      scheduled_deactivate_at: string | null;
      birthday_bonus_enabled: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      vendor_id: string;
      name: string;
      stamps_required: number;
      reward_text: string;
      type?: string;
      config?: Json;
      active?: boolean;
      expiry_days?: number | null;
      reward_expiry_days?: number | null;
      reward_cost_cents?: number | null;
      head_start?: boolean;
      replaced_by?: string | null;
      carry_over_stamps?: boolean;
      head_start_percent?: number;
      scheduled_deactivate_at?: string | null;
      birthday_bonus_enabled?: boolean;
      created_at?: string;
    };
    Update: {
      id?: string;
      vendor_id?: string;
      name?: string;
      stamps_required?: number;
      reward_text?: string;
      type?: string;
      config?: Json;
      active?: boolean;
      expiry_days?: number | null;
      reward_expiry_days?: number | null;
      reward_cost_cents?: number | null;
      head_start?: boolean;
      replaced_by?: string | null;
      carry_over_stamps?: boolean;
      head_start_percent?: number;
      scheduled_deactivate_at?: string | null;
      birthday_bonus_enabled?: boolean;
      created_at?: string;
    };
    Relationships: [];
  };
  cards: {
    Row: {
      id: string;
      program_id: string;
      phone: string;
      stamp_count: number;
      reward_count: number;
      state: Json;
      card_token: string;
      last_event_at: string | null;
      cycle_started_at: string;
      customer_name: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      program_id: string;
      phone: string;
      stamp_count?: number;
      reward_count?: number;
      state?: Json;
      card_token?: string;
      last_event_at?: string | null;
      cycle_started_at?: string;
      customer_name?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      program_id?: string;
      phone?: string;
      stamp_count?: number;
      reward_count?: number;
      state?: Json;
      card_token?: string;
      last_event_at?: string | null;
      cycle_started_at?: string;
      customer_name?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [];
  };
  stamp_events: {
    Row: {
      id: string;
      card_id: string;
      kind: string;
      payload: Json | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      card_id: string;
      kind: string;
      payload?: Json | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      card_id?: string;
      kind?: string;
      payload?: Json | null;
      created_at?: string;
    };
    Relationships: [];
  };
  reward_vouchers: {
    Row: {
      id: string;
      card_id: string;
      program_id: string;
      reward_text: string;
      earned_at: string;
      expires_at: string | null;
      redeemed_at: string | null;
      status: string;
      updated_at: string;
      voucher_token: string | null;
    };
    Insert: {
      id?: string;
      card_id: string;
      program_id: string;
      reward_text: string;
      earned_at?: string;
      expires_at?: string | null;
      redeemed_at?: string | null;
      status?: string;
      updated_at?: string;
      voucher_token?: string | null;
    };
    Update: {
      id?: string;
      card_id?: string;
      program_id?: string;
      reward_text?: string;
      earned_at?: string;
      expires_at?: string | null;
      redeemed_at?: string | null;
      status?: string;
      updated_at?: string;
      voucher_token?: string | null;
    };
    Relationships: [];
  };
  admins: {
    Row: {
      user_id: string;
      created_at: string;
    };
    Insert: {
      user_id: string;
      created_at?: string;
    };
    Update: {
      user_id?: string;
      created_at?: string;
    };
    Relationships: [];
  };
  admin_audit: {
    Row: {
      id: string;
      admin_id: string;
      action: string;
      target_id: string | null;
      detail: Json | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      admin_id: string;
      action: string;
      target_id?: string | null;
      detail?: Json | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      admin_id?: string;
      action?: string;
      target_id?: string | null;
      detail?: Json | null;
      created_at?: string;
    };
    Relationships: [];
  };
};
