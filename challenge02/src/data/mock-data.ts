import type {
  Comment,
  Issue,
  Property,
  TimelineEvent,
  Vendor,
} from "@/lib/types";

/*
 * Seed data for the REMI operator portal.
 *
 * Timestamps are generated *relative to now* so the dashboard always feels
 * live ("2 hours ago", "yesterday") on first load. After the first render the
 * Zustand `persist` middleware snapshots this into localStorage, so subsequent
 * edits — comments, status changes — survive reloads.
 */

const NOW = Date.now();
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MIN = 60_000;

/** ISO timestamp `n` units before now. */
const ago = (opts: { d?: number; h?: number; m?: number }): string =>
  new Date(
    NOW - (opts.d ?? 0) * DAY - (opts.h ?? 0) * HOUR - (opts.m ?? 0) * MIN,
  ).toISOString();

/* -------------------------------------------------------------------------- */
/*  Properties                                                                 */
/* -------------------------------------------------------------------------- */

export const seedProperties: Property[] = [
  {
    id: "prop_mountain_muse",
    name: "Mountain Muse",
    address: "421 Aspen Ridge Rd, Aspen, CO 81611",
    type: "Cabin",
    bedrooms: 3,
    bathrooms: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80&auto=format&fit=crop",
    createdAt: ago({ d: 240 }),
  },
  {
    id: "prop_cine_lodge",
    name: "Cine Lodge",
    address: "88 Vine St, Los Angeles, CA 90028",
    type: "Loft",
    bedrooms: 2,
    bathrooms: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop",
    createdAt: ago({ d: 220 }),
  },
  {
    id: "prop_lake_escape",
    name: "Lake Escape",
    address: "12 Shoreline Dr, South Lake Tahoe, CA 96150",
    type: "Cottage",
    bedrooms: 4,
    bathrooms: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format&fit=crop",
    createdAt: ago({ d: 180 }),
  },
  {
    id: "prop_sunset_villa",
    name: "Sunset Villa",
    address: "9 Pacific Coast Hwy, Malibu, CA 90265",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&auto=format&fit=crop",
    createdAt: ago({ d: 150 }),
  },
  {
    id: "prop_urban_nest",
    name: "Urban Nest",
    address: "1500 Congress Ave, Austin, TX 78701",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
    createdAt: ago({ d: 95 }),
  },
];

/* -------------------------------------------------------------------------- */
/*  Vendors                                                                    */
/* -------------------------------------------------------------------------- */

export const seedVendors: Vendor[] = [
  {
    id: "ven_mike_johnson",
    name: "Mike Johnson",
    type: "Handyman",
    phone: "+1 (970) 555-0142",
    email: "mike@handyaspen.com",
    serviceArea: "Aspen & Roaring Fork Valley, CO",
    notes: "Reliable for quick fixes. Same-day for urgent jobs. Cash or Venmo.",
    createdAt: ago({ d: 230 }),
  },
  {
    id: "ven_abc_plumbing",
    name: "ABC Plumbing",
    type: "Plumber",
    phone: "+1 (970) 555-0188",
    email: "dispatch@abcplumbing.com",
    serviceArea: "Aspen & Glenwood Springs, CO",
    notes: "Licensed & insured. 24/7 emergency line. Charges a $95 call-out fee.",
    createdAt: ago({ d: 228 }),
  },
  {
    id: "ven_savannah_reed",
    name: "Savannah Reed",
    type: "Co-Host",
    phone: "+1 (530) 555-0117",
    email: "savannah.reed@gmail.com",
    serviceArea: "South Lake Tahoe, CA",
    notes: "On-the-ground co-host for the Tahoe property. Handles turnovers & guest issues.",
    createdAt: ago({ d: 175 }),
  },
  {
    id: "ven_brightspark_electric",
    name: "BrightSpark Electric",
    type: "Electrician",
    phone: "+1 (213) 555-0164",
    email: "service@brightspark-la.com",
    serviceArea: "Greater Los Angeles, CA",
    notes: "Master electricians. Book 2–3 days ahead for non-emergencies.",
    createdAt: ago({ d: 200 }),
  },
  {
    id: "ven_crystalclean",
    name: "CrystalClean Co.",
    type: "Cleaner",
    phone: "+1 (310) 555-0143",
    email: "bookings@crystalclean.co",
    serviceArea: "Malibu, Santa Monica & West LA, CA",
    notes: "Turnover cleaning + linens. Sends photo checklist after each clean.",
    createdAt: ago({ d: 140 }),
  },
  {
    id: "ven_sierra_comfort",
    name: "Sierra Comfort HVAC",
    type: "Handyman",
    phone: "+1 (530) 555-0199",
    email: "support@sierracomfort.com",
    serviceArea: "Northern & Central California",
    notes: "HVAC, heating & water-heater specialist. Travels statewide for big jobs.",
    createdAt: ago({ d: 160 }),
  },
  {
    id: "ven_lone_star_electric",
    name: "Lone Star Electric",
    type: "Electrician",
    phone: "+1 (512) 555-0176",
    email: "hello@lonestarelectric.com",
    serviceArea: "Austin Metro, TX",
    notes: "Fast scheduling. Great for smart-home & fixture installs.",
    createdAt: ago({ d: 90 }),
  },
  {
    id: "ven_pristine_maids",
    name: "Pristine Maids",
    type: "Cleaner",
    phone: "+1 (512) 555-0121",
    email: "team@pristinemaids.com",
    serviceArea: "Austin Metro, TX",
    notes: "Eco-friendly products. Reliable same-week turnover slots.",
    createdAt: ago({ d: 88 }),
  },
  {
    id: "ven_buildright",
    name: "BuildRight Contractors",
    type: "General Contractor",
    phone: "+1 (424) 555-0150",
    email: "projects@buildright.com",
    serviceArea: "Statewide — California",
    notes: "Larger repairs, remodels & structural work. Quotes within 48h.",
    createdAt: ago({ d: 130 }),
  },
  {
    id: "ven_alpine_handy",
    name: "Alpine Handy Hands",
    type: "Handyman",
    phone: "+1 (530) 555-0133",
    email: "alpine.handy@gmail.com",
    serviceArea: "South Lake Tahoe & Truckee, CA",
    notes: "Jack-of-all-trades. Good with appliances & winterization.",
    createdAt: ago({ d: 120 }),
  },
];

/* -------------------------------------------------------------------------- */
/*  Issues                                                                     */
/* -------------------------------------------------------------------------- */

/** Counter so generated comment/timeline ids stay unique + stable per issue. */
function evt(
  issueId: string,
  i: number,
  type: TimelineEvent["type"],
  message: string,
  actor: string,
  createdAt: string,
): TimelineEvent {
  return { id: `${issueId}_tl_${i}`, type, message, actor, createdAt };
}

function cmt(
  issueId: string,
  i: number,
  author: string,
  body: string,
  createdAt: string,
): Comment {
  return { id: `${issueId}_cm_${i}`, author, body, createdAt };
}

/** Derive createdAt/updatedAt from the activity so they always stay consistent. */
function makeIssue(
  base: Omit<Issue, "createdAt" | "updatedAt" | "timeline" | "comments">,
  timeline: TimelineEvent[],
  comments: Comment[],
): Issue {
  const times = [
    ...timeline.map((t) => t.createdAt),
    ...comments.map((c) => c.createdAt),
  ].sort();
  return {
    ...base,
    createdAt: timeline[0]?.createdAt ?? times[0],
    updatedAt: times[times.length - 1],
    timeline,
    comments,
  };
}

export const seedIssues: Issue[] = [
  /* 1 — In Progress / High / Plumbing ------------------------------------- */
  makeIssue(
    {
      id: "iss_sink_leak",
      title: "Kitchen sink leaking under the cabinet",
      description:
        "Guest reports a steady drip from the pipe under the kitchen sink. There's a small puddle forming inside the base cabinet and the cardboard liner is soaked. They've placed a bucket underneath for now.",
      propertyId: "prop_mountain_muse",
      status: "In Progress",
      priority: "High",
      category: "Plumbing",
      vendorId: "ven_abc_plumbing",
      reportedBy: "Laura M. (Guest)",
      reportedVia: "WhatsApp",
    },
    [
      evt("iss_sink_leak", 1, "created", "Issue reported via WhatsApp by Laura M. (Guest)", "REMI", ago({ d: 4, h: 6 })),
      evt("iss_sink_leak", 2, "status_changed", "Status changed from Reported to Diagnosing", "You", ago({ d: 4, h: 5 })),
      evt("iss_sink_leak", 3, "status_changed", "Status changed from Diagnosing to Vendor Needed", "You", ago({ d: 4, h: 3 })),
      evt("iss_sink_leak", 4, "vendor_assigned", "ABC Plumbing assigned as vendor", "You", ago({ d: 3, h: 20 })),
      evt("iss_sink_leak", 5, "status_changed", "Status changed from Vendor Assigned to In Progress", "ABC Plumbing", ago({ h: 6 })),
    ],
    [
      cmt("iss_sink_leak", 1, "You", "Confirmed with the guest — it's the supply line, not the drain. Shutting the under-sink valve as a temp measure.", ago({ d: 4, h: 4 })),
      cmt("iss_sink_leak", 2, "Savannah Reed", "ABC quoted ~$140 for a valve + flex line replacement. Approved.", ago({ d: 3, h: 19 })),
      cmt("iss_sink_leak", 3, "ABC Plumbing", "On site now. Replacing the corroded shut-off valve and the braided supply line. Should be done within the hour.", ago({ h: 6 })),
    ],
  ),

  /* 2 — Vendor Assigned / Urgent / HVAC ----------------------------------- */
  makeIssue(
    {
      id: "iss_ac_master",
      title: "Master bedroom AC not cooling",
      description:
        "AC unit runs but only blows warm air in the master suite. Outside temps are hitting 95°F and guests have two more nights. They've moved to the guest room fans for now but want this fixed ASAP.",
      propertyId: "prop_sunset_villa",
      status: "Vendor Assigned",
      priority: "Urgent",
      category: "HVAC",
      vendorId: "ven_sierra_comfort",
      reportedBy: "Raj P. (Guest)",
      reportedVia: "SMS",
    },
    [
      evt("iss_ac_master", 1, "created", "Issue reported via SMS by Raj P. (Guest)", "REMI", ago({ d: 1, h: 18 })),
      evt("iss_ac_master", 2, "priority_changed", "Priority changed from High to Urgent", "You", ago({ d: 1, h: 17 })),
      evt("iss_ac_master", 3, "status_changed", "Status changed from Reported to Vendor Needed", "You", ago({ d: 1, h: 17 })),
      evt("iss_ac_master", 4, "vendor_assigned", "Sierra Comfort HVAC assigned as vendor", "You", ago({ h: 20 })),
    ],
    [
      cmt("iss_ac_master", 1, "You", "Sounds like a failed compressor or low refrigerant. Sierra Comfort is the only HVAC pro who covers Malibu — reaching out now.", ago({ d: 1, h: 17, m: 30 })),
      cmt("iss_ac_master", 2, "Sierra Comfort HVAC", "Can be there tomorrow 8–10am. Bringing gauges + a spare capacitor in case it's the start cap.", ago({ h: 19 })),
      cmt("iss_ac_master", 3, "You", "Booked for 8am. Offered the guest a $75 credit for the inconvenience — they're happy to wait.", ago({ h: 18 })),
    ],
  ),

  /* 3 — Vendor Needed / Medium / Electrical ------------------------------- */
  makeIssue(
    {
      id: "iss_flicker_lights",
      title: "Flickering lights in the living room",
      description:
        "Recessed lights in the living room flicker intermittently, especially when the kitchen is in use. Not a blown bulb — multiple fixtures do it at once. Could be a loose connection or a breaker issue.",
      propertyId: "prop_cine_lodge",
      status: "Vendor Needed",
      priority: "Medium",
      category: "Electrical",
      vendorId: null,
      reportedBy: "Tom H. (Guest)",
      reportedVia: "SMS",
    },
    [
      evt("iss_flicker_lights", 1, "created", "Issue reported via SMS by Tom H. (Guest)", "REMI", ago({ d: 1, h: 4 })),
      evt("iss_flicker_lights", 2, "status_changed", "Status changed from Reported to Diagnosing", "You", ago({ d: 1, h: 2 })),
      evt("iss_flicker_lights", 3, "status_changed", "Status changed from Diagnosing to Vendor Needed", "You", ago({ h: 22 })),
    ],
    [
      cmt("iss_flicker_lights", 1, "You", "Asked the guest to flip the living-room breaker off/on — no change. Needs an electrician to inspect the panel and junction boxes.", ago({ h: 23 })),
    ],
  ),

  /* 4 — Diagnosing / Medium / Appliance ----------------------------------- */
  makeIssue(
    {
      id: "iss_dishwasher",
      title: "Dishwasher won't drain",
      description:
        "Standing water at the bottom of the dishwasher after every cycle. Guest tried running it again with no luck. Likely a clogged filter or drain hose.",
      propertyId: "prop_urban_nest",
      status: "Diagnosing",
      priority: "Medium",
      category: "Appliance",
      vendorId: null,
      reportedBy: "Nina K. (Guest)",
      reportedVia: "WhatsApp",
    },
    [
      evt("iss_dishwasher", 1, "created", "Issue reported via WhatsApp by Nina K. (Guest)", "REMI", ago({ h: 9 })),
      evt("iss_dishwasher", 2, "status_changed", "Status changed from Reported to Diagnosing", "You", ago({ h: 7 })),
    ],
    [
      cmt("iss_dishwasher", 1, "You", "Sent the guest a quick video on cleaning the filter basket — if that doesn't clear it, we'll get Lone Star out to check the drain pump.", ago({ h: 6 })),
    ],
  ),

  /* 5 — Vendor Assigned / High / Cleaning --------------------------------- */
  makeIssue(
    {
      id: "iss_deep_clean",
      title: "Deep clean & linen reset before Friday check-in",
      description:
        "Back-to-back bookings with only a 4-hour gap. Need a full turnover: deep clean, fresh linens for all 4 bedrooms, restock consumables, and a quick hot-tub wipe-down. VIP guest, so it has to be spotless.",
      propertyId: "prop_lake_escape",
      status: "Vendor Assigned",
      priority: "High",
      category: "Cleaning",
      vendorId: "ven_savannah_reed",
      reportedBy: "You (Host)",
      reportedVia: "Manual",
    },
    [
      evt("iss_deep_clean", 1, "created", "Issue created manually by You (Host)", "You", ago({ d: 2, h: 2 })),
      evt("iss_deep_clean", 2, "vendor_assigned", "Savannah Reed assigned to coordinate the turnover", "You", ago({ d: 2 })),
    ],
    [
      cmt("iss_deep_clean", 1, "Savannah Reed", "Got it — I'll handle the linens myself and bring in two cleaners for the deep clean. Hot tub will be drained & refilled Thursday night.", ago({ d: 1, h: 20 })),
      cmt("iss_deep_clean", 2, "You", "Perfect. Consumables are in the garage closet — code 4417. Thanks Savannah!", ago({ d: 1, h: 18 })),
    ],
  ),

  /* 6 — Reported / Low / Structural --------------------------------------- */
  makeIssue(
    {
      id: "iss_porch_railing",
      title: "Front porch railing is loose",
      description:
        "Cleaner noticed during turnover that the wooden railing on the front porch wobbles when leaned on. Not dangerous yet but should be re-anchored before it becomes a liability.",
      propertyId: "prop_mountain_muse",
      status: "Reported",
      priority: "Low",
      category: "Structural",
      vendorId: null,
      reportedBy: "Maria (Cleaner)",
      reportedVia: "Manual",
    },
    [
      evt("iss_porch_railing", 1, "created", "Issue reported manually by Maria (Cleaner)", "Maria (Cleaner)", ago({ h: 14 })),
    ],
    [],
  ),

  /* 7 — Resolved / High / Appliance --------------------------------------- */
  makeIssue(
    {
      id: "iss_water_heater",
      title: "Water heater making loud banging noise",
      description:
        "Loud knocking / banging from the water heater closet, especially when hot water runs. Sediment buildup suspected. Guest is worried it's about to fail.",
      propertyId: "prop_lake_escape",
      status: "Resolved",
      priority: "High",
      category: "Appliance",
      vendorId: "ven_alpine_handy",
      reportedBy: "Priya S. (Guest)",
      reportedVia: "WhatsApp",
    },
    [
      evt("iss_water_heater", 1, "created", "Issue reported via WhatsApp by Priya S. (Guest)", "REMI", ago({ d: 6, h: 3 })),
      evt("iss_water_heater", 2, "status_changed", "Status changed from Reported to Vendor Needed", "You", ago({ d: 6, h: 1 })),
      evt("iss_water_heater", 3, "vendor_assigned", "Alpine Handy Hands assigned as vendor", "You", ago({ d: 5, h: 20 })),
      evt("iss_water_heater", 4, "status_changed", "Status changed from Vendor Assigned to In Progress", "Alpine Handy Hands", ago({ d: 5, h: 2 })),
      evt("iss_water_heater", 5, "status_changed", "Status changed from In Progress to Resolved", "Alpine Handy Hands", ago({ d: 4, h: 22 })),
    ],
    [
      cmt("iss_water_heater", 1, "Alpine Handy Hands", "Flushed the tank — there was heavy sediment. Banging is gone. Recommend an annual flush; I can put it on a schedule.", ago({ d: 4, h: 22 })),
      cmt("iss_water_heater", 2, "You", "Great, thank you! Let's schedule the annual flush. I'll verify with the next guest that the noise is fully gone before closing this out.", ago({ d: 4, h: 20 })),
    ],
  ),

  /* 8 — Verified / Low / Electrical --------------------------------------- */
  makeIssue(
    {
      id: "iss_exhaust_fan",
      title: "Bathroom exhaust fan not working",
      description:
        "Guest bathroom exhaust fan stopped spinning — bathroom gets steamy and the mirror fogs badly. Switch clicks but the fan is silent.",
      propertyId: "prop_cine_lodge",
      status: "Verified",
      priority: "Low",
      category: "Electrical",
      vendorId: "ven_brightspark_electric",
      reportedBy: "Alex T. (Guest)",
      reportedVia: "SMS",
    },
    [
      evt("iss_exhaust_fan", 1, "created", "Issue reported via SMS by Alex T. (Guest)", "REMI", ago({ d: 12 })),
      evt("iss_exhaust_fan", 2, "vendor_assigned", "BrightSpark Electric assigned as vendor", "You", ago({ d: 11, h: 4 })),
      evt("iss_exhaust_fan", 3, "status_changed", "Status changed from Vendor Assigned to In Progress", "BrightSpark Electric", ago({ d: 9, h: 6 })),
      evt("iss_exhaust_fan", 4, "status_changed", "Status changed from In Progress to Resolved", "BrightSpark Electric", ago({ d: 9, h: 3 })),
      evt("iss_exhaust_fan", 5, "status_changed", "Status changed from Resolved to Verified", "You", ago({ d: 8 })),
    ],
    [
      cmt("iss_exhaust_fan", 1, "BrightSpark Electric", "Motor had seized. Swapped in a new quiet-series fan motor and cleaned the housing. Tested — pulling air fine now.", ago({ d: 9, h: 3 })),
      cmt("iss_exhaust_fan", 2, "You", "Verified with the next guest — fan works great and it's much quieter. Leaving open one more day before closing.", ago({ d: 8 })),
    ],
  ),

  /* 9 — Closed / Medium / Appliance --------------------------------------- */
  makeIssue(
    {
      id: "iss_garbage_disposal",
      title: "Broken garbage disposal",
      description:
        "Garbage disposal hums but won't turn — likely jammed or the motor's gone. Guest smelled a faint burning odor, so they've stopped using it.",
      propertyId: "prop_sunset_villa",
      status: "Closed",
      priority: "Medium",
      category: "Appliance",
      vendorId: "ven_buildright",
      reportedBy: "Dana W. (Guest)",
      reportedVia: "WhatsApp",
    },
    [
      evt("iss_garbage_disposal", 1, "created", "Issue reported via WhatsApp by Dana W. (Guest)", "REMI", ago({ d: 20 })),
      evt("iss_garbage_disposal", 2, "vendor_assigned", "BuildRight Contractors assigned as vendor", "You", ago({ d: 19, h: 6 })),
      evt("iss_garbage_disposal", 3, "status_changed", "Status changed from Vendor Assigned to In Progress", "BuildRight Contractors", ago({ d: 18 })),
      evt("iss_garbage_disposal", 4, "status_changed", "Status changed from In Progress to Resolved", "BuildRight Contractors", ago({ d: 17, h: 20 })),
      evt("iss_garbage_disposal", 5, "status_changed", "Status changed from Resolved to Verified", "You", ago({ d: 16 })),
      evt("iss_garbage_disposal", 6, "status_changed", "Status changed from Verified to Closed", "You", ago({ d: 15 })),
    ],
    [
      cmt("iss_garbage_disposal", 1, "BuildRight Contractors", "Old unit was burnt out. Installed a new 3/4 HP InSinkErator. Receipt uploaded to the shared drive.", ago({ d: 17, h: 20 })),
      cmt("iss_garbage_disposal", 2, "You", "Confirmed working. Closing this out — thanks for the fast turnaround.", ago({ d: 15 })),
    ],
  ),
];
