import type { FaqGroup } from "@merqo/ui";
import { PRICING_LINE } from "@/components/landing/waitlist";

export const FAQ_TITLE = "Frequently asked questions";

// States readiness up front: loopkit is built but not yet tried with vendors.
export const FAQ_INTRO =
  "loopkit is a stamp and rewards tool for your counter. It is in build, built but not yet tried with vendors.";

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "getting-started",
    heading: "Getting started",
    rows: [
      {
        q: "Do customers need to download an app?",
        a: "No. Customers scan a QR at your counter and their stamp card lives on a web page, nothing to install.",
      },
      {
        q: "How long does it take to set up a loyalty program?",
        a: "Pick stamps, points, or a lucky-draw reward, print the QR, and you're running a program.",
      },
      {
        q: "What do I need at the counter?",
        a: "A phone with a camera to scan a customer's code. You can also type in a customer's phone number to find or start their card.",
      },
      {
        q: "Can I choose the reward?",
        a: "Yes. You decide the reward, what earns a stamp and how many stamps it takes. Merqo does not set or promise any reward, so you honour what you set up.",
      },
    ],
  },
  {
    id: "customers-and-cards",
    heading: "Customers and their cards",
    rows: [
      {
        q: "What happens when a customer completes their card?",
        a: "On a stamp card, they show their card at your counter and you redeem the reward you set up, such as a free item or a discount.",
      },
      {
        q: "What if a customer loses their phone or switches browser?",
        a: "Their card is tied to the browser they joined on, so they need the saved card code to open it again. If they lost the code, you can recover their card from your dashboard and their progress is kept.",
      },
      {
        q: "Can customers delete their data?",
        a: "Yes. From their card page, a customer can delete their stamps, rewards, vouchers, phone number and offer choices at your shop. It cannot be undone, and other shops are not affected.",
      },
    ],
  },
  {
    id: "cost-and-data",
    heading: "Cost and your data",
    rows: [
      { q: "What does it cost?", a: PRICING_LINE },
      {
        q: "Do customers get marketing messages?",
        a: "Not unless they choose to. Joining never asks for marketing consent, and the opt-in box starts unticked.",
      },
      {
        q: "Who runs loopkit?",
        a: "loopkit is part of Merqo, a personal software project built and run by Clarence Lee. Merqo is not a registered company.",
      },
    ],
  },
];
