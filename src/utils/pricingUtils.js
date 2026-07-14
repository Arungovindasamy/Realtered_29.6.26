// ─── Timezone-safe local date parser ─────────────────────────────────────────
export const parseLocalDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "string") {
    const datePart = value.includes("T") ? value.split("T")[0] : value;
    const parts = datePart.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day);
        }
      } else {
        // dd-mm-yyyy
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          if (year < 100) year += 2000;
          return new Date(year, month, day);
        }
      }
    }
  }

  const parseDateSafe = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    let d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
    if (typeof dateVal === 'string') {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const fullYear = year < 100 ? 2000 + year : year;
          d = new Date(fullYear, month, day);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
    return null;
  };

  const fallback = parseDateSafe(value);
  if (fallback && !isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getTime());
  }
  return null;
};

// ─── Duration Months count ───────────────────────────────────────────
export const getDurationMonthsCount = (duration) => {
  if (duration === "12 Months") return 12;
  if (duration === "6 Months") return 6;
  if (duration === "3 Months") return 3;
  return 1;
};

// ─── Duration price multiplier ───────────────────────────────────────────
export const getDurationMultiplier = (duration) => {
  if (duration === "12 Months") return 10;
  if (duration === "6 Months") return 5;
  if (duration === "3 Months") return 3;
  return 1;
};

export const roundCurrency = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

// ─── Inclusive end-date calculations ─────────────────────────────────────────
// endDate = startDate + durationMonths - 1 day
export const calculateInclusiveEndDate = (startDateVal, duration) => {
  const start = parseLocalDate(startDateVal);
  if (!start) return new Date(startDateVal);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  end.setMonth(end.getMonth() + getDurationMonthsCount(duration));
  end.setDate(end.getDate() - 1);
  return end;
};

// ─── Detects exclusive backend dates and shifts back ────────────────────────
export const getInclusiveEffectiveEndDate = (subscription) => {
  if (!subscription) return null;

  const start = parseLocalDate(
    subscription.startedDate || subscription.startDate || subscription.Starteddate
  );
  const rawEnd = parseLocalDate(
    subscription.endedDate ||
    subscription.endDate ||
    subscription.Endeddate ||
    subscription.expiryDate ||
    subscription.expiredOn ||
    subscription.validTill
  );

  if (!rawEnd) return null;
  if (!start) return rawEnd;

  const isLikelyExclusive = rawEnd.getDate() === start.getDate() && rawEnd.getTime() > start.getTime();
  if (!isLikelyExclusive) return rawEnd;

  const corrected = new Date(rawEnd.getFullYear(), rawEnd.getMonth(), rawEnd.getDate());
  corrected.setDate(corrected.getDate() - 1);
  return corrected;
};

// When an upgrade has been scheduled inside the active plan's original term,
// the credited/waived period begins on the scheduled start date. The old plan
// therefore remains valid only through the preceding calendar day.
export const getActiveEndBeforeScheduledStart = (activeSubscription, scheduledSubscription) => {
  const activeEnd = getInclusiveEffectiveEndDate(activeSubscription);
  const scheduledStart = parseLocalDate(
    scheduledSubscription?.startedDate ||
    scheduledSubscription?.startDate ||
    scheduledSubscription?.Starteddate
  );

  if (!activeEnd || !scheduledStart || scheduledStart > activeEnd) {
    return activeEnd;
  }

  const adjustedEnd = new Date(
    scheduledStart.getFullYear(),
    scheduledStart.getMonth(),
    scheduledStart.getDate() - 1
  );
  return adjustedEnd;
};

// ─── Date diffing helpers ───────────────────────────────────────────────────
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diff = d2.getTime() - d1.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export const calculateExactMonths = (start, end) => {
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.round(diffDays / 30);
};

// ─── Plan Ranking helper ────────────────────────────────────────────────────
export const getPlanRank = (planName) => {
  const name = String(planName || "").trim().toLowerCase();
  if (name.includes("enterprise")) return 3;
  if (name.includes("pro")) return 2;
  if (name.includes("growth")) return 1;
  return 0;
};

export const SCHEDULED_HIGHER_PLAN_ERROR = (planName) =>
  `You already have a scheduled ${planName || "higher"} plan.\n\n` +
  "A lower plan cannot be purchased because it would create an invalid subscription timeline.\n\n" +
  `Please cancel your scheduled ${planName || "higher"} plan before purchasing a lower plan.`;

// Classify before pricing or payment: the scheduled plan is the seller's
// committed future subscription.
export const getScheduledPlanPurchaseDecision = (selectedPlan, scheduledSubscription) => {
  if (!selectedPlan || !scheduledSubscription) {
    return { action: "purchase", blocked: false, message: "" };
  }

  const selectedName = selectedPlan.name || selectedPlan.planName || selectedPlan.plan;
  const scheduledName = scheduledSubscription.planName || scheduledSubscription.plan || scheduledSubscription.subscriptionPlan;
  const selectedRank = getPlanRank(selectedName);
  const scheduledRank = getPlanRank(scheduledName);

  if (!selectedRank || !scheduledRank) {
    return { action: "purchase", blocked: false, message: "" };
  }
  if (selectedRank < scheduledRank) {
    return { action: "reject", blocked: true, message: SCHEDULED_HIGHER_PLAN_ERROR(scheduledName) };
  }
  if (selectedRank === scheduledRank) {
    return { action: "reschedule", blocked: false, message: "" };
  }
  return { action: "replace", blocked: false, message: "" };
};

// Renewal window: 1/2 months = last 7 days, 3 months = last 14 days, 6/12 months = last 30 days
export const getRenewalWindowDays = (months) => {
  if (months >= 6) return 30;
  if (months >= 3) return 14;
  return 7;
};

export const isWithinRenewalWindow = (currentSubscription, oldExpiry) => {
  if (!currentSubscription || !oldExpiry) return false;
  const start = parseLocalDate(currentSubscription.startedDate || currentSubscription.startDate);
  if (!start) return false;
  const months = calculateExactMonths(start, oldExpiry);
  const windowDays = getRenewalWindowDays(months);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(oldExpiry);
  expiry.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= windowDays;
};

// ─── Upgrade Waive-off Calculation ──────────────────────────────────────────
export const calculateUpgradeWaiveOff = (currentSubscription, oldPlan, selectedStartDate, plans) => {
  if (!currentSubscription) {
    return {
      totalDays: 0,
      remainingDays: 0,
      dailyRate: 0,
      remainingAmount: 0,
      oldEffectiveAmount: 0
    };
  }

  const currentStart = parseLocalDate(currentSubscription.startedDate || currentSubscription.startDate);
  const currentEnd = getInclusiveEffectiveEndDate(currentSubscription);
  const upgradeStart = parseLocalDate(selectedStartDate) || new Date();

  if (!currentStart || !currentEnd) {
    return {
      totalDays: 0,
      remainingDays: 0,
      dailyRate: 0,
      remainingAmount: 0,
      oldEffectiveAmount: 0
    };
  }

  // Calculate old effective amount paid (plan price * multiplier)
  let oldEffectiveAmount = Number(currentSubscription.amount || currentSubscription.price || 0);
  if (!oldEffectiveAmount && oldPlan) {
    const totalMonths = calculateExactMonths(currentStart, currentEnd);
    const oldDuration =
      totalMonths >= 12 ? "12 Months" :
        totalMonths >= 6 ? "6 Months" :
          totalMonths >= 3 ? "3 Months" :
            "1 Month";
    oldEffectiveAmount = Number(oldPlan.price || oldPlan.amount || 0) * getDurationMultiplier(oldDuration);
  }

  const totalDays = daysBetween(currentStart, currentEnd) + 1;

  let remainingDays = 0;
  if (upgradeStart <= currentEnd) {
    if (upgradeStart < currentStart) {
      remainingDays = totalDays;
    } else {
      remainingDays = daysBetween(upgradeStart, currentEnd) + 1;
    }
  }

  const dailyRate = totalDays > 0 ? (oldEffectiveAmount / totalDays) : 0;
  const remainingAmount = totalDays > 0
    ? Math.max(0, roundCurrency(remainingDays * dailyRate))
    : 0;

  return {
    oldEffectiveAmount,
    totalDays,
    remainingDays,
    dailyRate,
    remainingAmount
  };
};

// ─── Central Pricing Calculator ─────────────────────────────────────────────
export const calculatePlanPricing = ({
  selectedPlan,
  planDuration,
  currentSubscription,
  oldPlan,
  selectedStartDate,
  discountAmount,
  useWallet,
  walletBalance,
  plans
}) => {
  const basePrice = selectedPlan ? Number(selectedPlan.price || selectedPlan.amount || 0) : 0;
  const newMultiplier = getDurationMultiplier(planDuration);
  const totalPrice = basePrice * newMultiplier;

  // Resolve old plan rank
  const currentRank = currentSubscription ? getPlanRank(currentSubscription.planName || currentSubscription.plan) : 0;
  const selectedRank = selectedPlan ? getPlanRank(selectedPlan.name || selectedPlan.planName) : 0;
  
  // Upgrade check
  const start = currentSubscription ? parseLocalDate(currentSubscription.startedDate || currentSubscription.startDate) : null;
  const end = getInclusiveEffectiveEndDate(currentSubscription);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const isOldActive = Boolean(
    currentSubscription &&
    start &&
    end &&
    currentSubscription.status?.toLowerCase() === "active" &&
    today >= start &&
    today <= end
  );
  
  const isUpgrade = Boolean(currentSubscription && isOldActive && selectedRank > currentRank);

  // Waive-off details
  const waiveOffDetails = (isUpgrade && currentSubscription)
    ? calculateUpgradeWaiveOff(currentSubscription, oldPlan, selectedStartDate, plans)
    : { oldEffectiveAmount: 0, totalDays: 0, remainingDays: 0, dailyRate: 0, remainingAmount: 0 };

  const remainingAmount = Math.min(
    roundCurrency(waiveOffDetails.remainingAmount),
    roundCurrency(totalPrice)
  );

  // Payable before wallet
  const payableBeforeWallet = roundCurrency(
    Math.max(totalPrice - remainingAmount - discountAmount, 0)
  );

  // Wallet
  const walletUsedAmount = useWallet
    ? roundCurrency(Math.min(walletBalance, payableBeforeWallet))
    : 0;

  // Payable amount (Razorpay)
  const payableAmount = roundCurrency(
    Math.max(payableBeforeWallet - walletUsedAmount, 0)
  );

  return {
    basePrice,
    totalPrice,
    isUpgrade,
    waiveOffDetails,
    remainingAmount,
    payableBeforeWallet,
    walletUsedAmount,
    payableAmount
  };
};
