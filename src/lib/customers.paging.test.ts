import { beforeEach, describe, expect, it, vi } from "vitest";

type Customer = {
  phone: string;
  name: string | null;
  first_seen_at: string;
  last_seen_at: string;
};
type Card = {
  id: string;
  phone: string;
  program_id: string;
  stamp_count: number;
  reward_count: number;
  updated_at: string;
};

const m = vi.hoisted(() => ({
  customers: [] as Customer[],
  cards: [] as Card[],
  calls: [] as [string, unknown[]][],
}));

vi.mock("@/lib/program", () => ({
  listPrograms: vi.fn(async () => [
    { id: "p1", name: "Coffee", stamps_required: 5 },
  ]),
}));

function byRecency(a: Customer, b: Customer): number {
  if (a.last_seen_at !== b.last_seen_at)
    return a.last_seen_at < b.last_seen_at ? 1 : -1;
  return a.phone < b.phone ? -1 : 1;
}

function like(value: string, pattern: string): boolean {
  let regex = "";
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === "\\") regex += `\\${pattern[++i]}`;
    else if (ch === "%") regex += ".*";
    else if (ch === "_") regex += ".";
    else regex += ch.replace(/[.*+?^${}()|[\]]/g, "\\$&");
  }
  return new RegExp(`^${regex}$`, "i").test(value);
}

function customersQuery() {
  let rows = [...m.customers];
  let max = Infinity;
  const chain = {
    select: () => chain,
    order: () => chain,
    limit: (n: number) => {
      max = n;
      return chain;
    },
    ilike: (col: string, pattern: string) => {
      m.calls.push(["ilike", [col, pattern]]);
      rows = rows.filter((r) => like(r.phone, pattern));
      return chain;
    },
    or: (filter: string) => {
      m.calls.push(["or", [filter]]);
      const match =
        /^last_seen_at\.lt\."([^"]+)",and\(last_seen_at\.eq\."\1",phone\.gt\."([^"]+)"\)$/.exec(
          filter,
        );
      if (!match) throw new Error(`unexpected filter ${filter}`);
      const [, at, phone] = match;
      rows = rows.filter(
        (r) =>
          r.last_seen_at < at || (r.last_seen_at === at && r.phone > phone),
      );
      return chain;
    },
    then: (resolve: (v: unknown) => void) => {
      const sorted = rows.sort(byRecency);
      resolve({ data: sorted.slice(0, max), error: null });
    },
  };
  return chain;
}

function cardsQuery() {
  let rows = [...m.cards];
  const chain = {
    select: () => chain,
    in: (col: string, values: string[]) => {
      m.calls.push(["cards.in", [col, values]]);
      rows = rows.filter((r) => values.includes(r[col as "phone"]));
      return chain;
    },
    order: () => chain,
    range: (start: number, end: number) =>
      Promise.resolve({ data: rows.slice(start, end + 1), error: null }),
  };
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({
    from: (table: string) =>
      table === "customers" ? customersQuery() : cardsQuery(),
  })),
}));

import {
  decodeCustomerCursor,
  encodeCustomerCursor,
  listVendorCustomers,
} from "./customers";

const TIE = "2026-10-08T00:00:00.000000+00:00";
function customer(phone: string, last_seen_at: string): Customer {
  return { phone, name: null, first_seen_at: last_seen_at, last_seen_at };
}

beforeEach(() => {
  m.calls.length = 0;
  m.cards = [];
  m.customers = [];
  for (let i = 0; i < 7; i++) {
    m.customers.push(
      customer(
        `+65900000${10 + i}`,
        `2026-10-0${i < 4 ? 8 : 7}T00:00:00.000000+00:00`,
      ),
    );
  }
  m.customers.push(customer("+6590000001", TIE));
});

describe("listVendorCustomers paging", () => {
  it("defaults to 50 rows per page", async () => {
    m.customers = Array.from({ length: 60 }, (_, i) =>
      customer(`+65910000${String(i).padStart(2, "0")}`, TIE),
    );
    const page = await listVendorCustomers();
    expect(page.rows).toHaveLength(50);
    expect(page.nextCursor).not.toBeNull();
  });

  it("page 2 continues page 1 with no overlap and no gap, including ties", async () => {
    const seen: string[] = [];
    let cursor: string | undefined;
    for (let guard = 0; guard < 10; guard++) {
      const page = await listVendorCustomers({ cursor, limit: 3 });
      seen.push(...page.rows.map((r) => r.phone));
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }
    const expected = [...m.customers].sort(byRecency).map((r) => r.phone);
    expect(seen).toEqual(expected);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("returns a null cursor on the last page", async () => {
    const page = await listVendorCustomers({ limit: 8 });
    expect(page.rows).toHaveLength(8);
    expect(page.nextCursor).toBeNull();
  });

  it("reads cards only for the phones on the page", async () => {
    m.cards = [
      {
        id: "c1",
        phone: "+6590000001",
        program_id: "p1",
        stamp_count: 2,
        reward_count: 0,
        updated_at: TIE,
      },
    ];
    const page = await listVendorCustomers({ limit: 2 });
    const phones = page.rows.map((r) => r.phone);
    const cardCall = m.calls.find(
      ([name, args]) => name === "cards.in" && args[0] === "phone",
    );
    expect(cardCall?.[1][1]).toEqual(phones);
  });

  it("ignores a malformed cursor instead of building a filter from it", async () => {
    const bad = Buffer.from(JSON.stringify(['x",phone.gt."', "+65"])).toString(
      "base64url",
    );
    await listVendorCustomers({ cursor: bad, limit: 3 });
    expect(m.calls.some(([name]) => name === "or")).toBe(false);
    expect(decodeCustomerCursor("not-base64-json")).toBeNull();
  });

  it("round-trips a cursor", () => {
    const encoded = encodeCustomerCursor({
      last_seen_at: TIE,
      phone: "+6590000001",
    });
    expect(decodeCustomerCursor(encoded)).toEqual({
      lastSeenAt: TIE,
      phone: "+6590000001",
    });
  });
});

describe("listVendorCustomers search", () => {
  it("escapes % so it only matches a literal percent sign", async () => {
    const page = await listVendorCustomers({ q: "%" });
    expect(page.rows).toHaveLength(0);
    expect(m.calls).toContainEqual(["ilike", ["phone", "%\\%%"]]);
  });

  it("escapes _ and backslash", async () => {
    await listVendorCustomers({ q: "_\\" });
    expect(m.calls).toContainEqual(["ilike", ["phone", "%\\_\\\\%"]]);
  });

  it("still matches plain digits", async () => {
    const page = await listVendorCustomers({ q: "0000001" });
    expect(page.rows.map((r) => r.phone)).toContain("+6590000001");
  });
});
