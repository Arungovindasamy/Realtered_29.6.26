import {
  getActiveEndBeforeScheduledStart,
  getScheduledPlanPurchaseDecision
} from "./pricingUtils";

describe("getScheduledPlanPurchaseDecision", () => {
  test.each([
    ["Pro", "Enterprise"],
    ["Growth", "Enterprise"]
  ])("rejects selected %s below scheduled %s", (selected, scheduled) => {
    const decision = getScheduledPlanPurchaseDecision(
      { name: selected },
      { planName: scheduled, status: "Scheduled" }
    );

    expect(decision.action).toBe("reject");
    expect(decision.blocked).toBe(true);
    expect(decision.message).toContain(`scheduled ${scheduled} plan`);
  });

  test.each([
    ["Enterprise", "Enterprise", "reschedule"],
    ["Growth", "Growth", "reschedule"],
    ["Enterprise", "Pro", "replace"],
    ["Enterprise", "Growth", "replace"]
  ])("classifies selected %s with scheduled %s as %s", (selected, scheduled, action) => {
    expect(
      getScheduledPlanPurchaseDecision(
        { name: selected },
        { planName: scheduled, status: "Scheduled" }
      ).action
    ).toBe(action);
  });
});

describe("getActiveEndBeforeScheduledStart", () => {
  test("ends the active plan one day before an overlapping scheduled upgrade", () => {
    const end = getActiveEndBeforeScheduledStart(
      { startedDate: "2026-07-13", endedDate: "2026-08-12" },
      { startedDate: "2026-07-30", endedDate: "2026-08-29" }
    );

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(6);
    expect(end.getDate()).toBe(29);
  });

  test("keeps a non-overlapping active end date unchanged", () => {
    const end = getActiveEndBeforeScheduledStart(
      { startedDate: "2026-07-13", endedDate: "2026-08-12" },
      { startedDate: "2026-08-13", endedDate: "2026-09-12" }
    );

    expect(end.getDate()).toBe(12);
  });
});
