import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, CheckCircle2, Check, ArrowRight } from "lucide-react";
import { resolveSellerId, resolveSellerEmail } from "../../utils/sellerSession";
import { sellerService } from "../../services/sellerService";
import "./GrowPlanPage.css";

// Fallback plans in case the plans API doesn't return data
const FALLBACK_PLANS = [
  {
    id: "growth_plan",
    name: "Growth",
    price: 999,
    features: [
      "Seller Verified Badge",
      "Featured placement in category + search (5 SKUs)",
      "\"Promoted Seller\" tag in app",
      "₹500 Ad Credit (Google + Meta)",
      "Basic analytics dashboard",
      "AI Product Title & Description Optimizer",
      "SEO Score for each product",
      "In-App Product Promotions",
      "Auto Keyword Suggestions for trending searches",
      "Expected boost: up to 1.3x sales"
    ]
  },
  {
    id: "pro_plan",
    name: "Pro",
    price: 1999,
    recommended: true,
    features: [
      "Seller Verified Badge",
      "Featured placement for 15 SKUs",
      "Priority \"Trending Now\" visibility",
      "₹1,200 Ad Credit (Google + Meta)",
      "1 Managed digital ad campaign/month",
      "Advanced Analytics",
      "AI Auto-Pricing Suggestions (competitive pricing alerts)",
      "In-App Product Promotions",
      "Cross-Sell Recommendation Engine",
      "Early Payout/Settlement (T+1)",
      "Priority logistics partners (where available)",
      "Expected boost: up to 2x sales"
    ]
  },
  {
    id: "enterprise_plan",
    name: "Enterprise",
    price: 2499,
    features: [
      "Seller Verified Badge",
      "Featured placement on all SKUs",
      "\"Top Seller\" premium badge in listings",
      "₹2,000 Ad Credit",
      "2 Managed ad campaigns/month",
      "Flash Sale Tools",
      "Search Result Boosting",
      "In-App Product Promotions",
      "Detailed conversion funnel analytics",
      "Cart Abandonment Notifications (Haatza sends push to buyers)",
      "Repeat Buyer Retargeting (push / in-app)",
      "Expected boost: up to 3x sales"
    ]
  }
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    let script = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const handleLoad = () => {
      cleanup();
      resolve(true);
    };

    const handleError = () => {
      cleanup();
      resolve(false);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
  });
};

const getTodayFormatted = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

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

const formatPlanDate = (dateValue) => {
  if (!dateValue) return "";
  const date = parseDateSafe(dateValue);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).replace(/ /g, " ");
};

const getLatestSubscription = (orders) => {
  if (!Array.isArray(orders) || orders.length === 0) return null;

  const parseDate = (val) => {
    if (!val) return 0;
    const dateObj = parseDateSafe(val);
    return dateObj ? dateObj.getTime() : 0;
  };

  const getSubTimestamp = (sub) => {
    const created = sub.createdDate || sub.createdAt || sub._createdDate || sub._createdAt;
    if (created) {
      const ts = parseDate(created);
      if (ts > 0) return ts;
    }
    const payment = sub.paymentDate || sub.paidAt || sub.paymentAt || sub.transactionDate;
    if (payment) {
      const ts = parseDate(payment);
      if (ts > 0) return ts;
    }
    const start = sub.startDate || sub.startedDate || sub.startAt;
    if (start) {
      const ts = parseDate(start);
      if (ts > 0) return ts;
    }
    const end = sub.endDate || sub.endedDate || sub.expiryDate || sub.expiredOn || sub.validTill;
    if (end) {
      const ts = parseDate(end);
      if (ts > 0) return ts;
    }
    return 0;
  };

  const sorted = [...orders].sort((a, b) => getSubTimestamp(b) - getSubTimestamp(a));
  return sorted[0];
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

const extractPlans = (response) => {
  const data = response?.data ?? response;
  const plans =
    data?.message?.items ??
    data?.message?.plans ??
    data?.message?.data?.items ??
    data?.message?.data?.plans ??
    data?.items ??
    data?.plans ??
    data?.data?.items ??
    data?.data?.plans ??
    data?.data?.message?.items ??
    data?.data?.message?.plans ??
    [];
  return asArray(plans);
};

const extractSubscriptionOrders = (response) => {
  const data = response?.data ?? response;
  const orders =
    data?.message?.orders ??
    data?.message?.subscriptions ??
    data?.message?.data?.orders ??
    data?.message?.data?.subscriptions ??
    data?.orders ??
    data?.subscriptions ??
    data?.data?.orders ??
    data?.data?.subscriptions ??
    data?.data?.message?.orders ??
    data?.data?.message?.subscriptions ??
    data?.message ??
    [];
  return asArray(orders);
};

const extractWalletBalance = (response) => {
  const data = response?.data ?? response;
  return Number(
    data?.message?.RemainingBalance ??
    data?.message?.remainingBalance ??
    data?.message?.balance ??
    data?.data?.RemainingBalance ??
    data?.data?.remainingBalance ??
    data?.RemainingBalance ??
    data?.remainingBalance ??
    data?.balance ??
    0
  );
};

const getDurationMultiplier = (duration) => {
  if (duration === "3 Months") return 3;
  if (duration === "6 Months") return 5;
  if (duration === "12 Months") return 10;
  return 1;
};

const getDurationMonths = (duration) => {
  if (duration === "3 Months") return 3;
  if (duration === "6 Months") return 6;
  if (duration === "12 Months") return 12;
  return 1;
};

const calculateRemainingAmount = (subscription) => {
  if (!subscription) return 0;

  const start = parseDateSafe(subscription.startedDate || subscription.startDate);
  const end = parseDateSafe(subscription.endedDate || subscription.endDate);
  const now = new Date();

  if (!start || !end || now >= end || now < start) {
    return 0;
  }

  const totalDuration = end.getTime() - start.getTime();
  const remainingDuration = end.getTime() - now.getTime();

  if (totalDuration <= 0 || remainingDuration <= 0) return 0;

  const originalAmount = Number(subscription.amount || subscription.price || 0);
  const remainingValue = (originalAmount * remainingDuration) / totalDuration;

  return Math.max(0, Math.round(remainingValue));
};


const GrowPlanPage = () => {
  const navigate = useNavigate();
  const sellerId = resolveSellerId();
  const sellerEmail = resolveSellerEmail();

  // View state: 'plans', 'review', 'success'
  const [viewState, setViewState] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});

  // Mobile-Aligned States
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [planDuration, setPlanDuration] = useState("1 Month");
  const [baseAmount, setBaseAmount] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletUsedAmount, setWalletUsedAmount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [startedDate, setStartedDate] = useState("");
  const [endedDate, setEndedDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Legacy Mappings
  const activeSubscription = currentSubscription;
  const setActiveSubscription = setCurrentSubscription;
  const walletBalance = availableBalance;
  const setWalletBalance = setAvailableBalance;
  const redeemWallet = useWallet;
  const setRedeemWallet = setUseWallet;
  const referralCode = couponCode;
  const setReferralCode = setCouponCode;
  const referralDiscount = discountAmount;
  const setReferralDiscount = setDiscountAmount;
  const isProcessing = isProcessingPayment;
  const setIsProcessing = setIsProcessingPayment;

  const [appliedReferralCode, setAppliedReferralCode] = useState("");

  // Loaders / Feedback states
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState({ text: "", type: "" });
  const [processingMessage, setProcessingMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  // Active/Existing Subscription status
  const [plansRes, setPlansRes] = useState(null);
  const [subscriptionRes, setSubscriptionRes] = useState(null);

  // Warning & Toast notification states
  const [subscriptionWarning, setSubscriptionWarning] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);

  // Dedupe payment handles
  const paymentInProgressRef = useRef(false);
  const processedPaymentRef = useRef(new Set());

  // Merge dynamic plans with static fallback features list for UI consistency
  const mapPlansWithFeatures = useCallback((apiPlans) => {
    if (!Array.isArray(apiPlans) || apiPlans.length === 0) {
      return FALLBACK_PLANS;
    }
    return apiPlans.map((plan) => {
      const nameLower = (plan.name || "").toLowerCase();
      let matchingFallback = FALLBACK_PLANS.find(p => p.name.toLowerCase() === nameLower);
      if (!matchingFallback) {
        matchingFallback = FALLBACK_PLANS.find(p => nameLower.includes(p.name.toLowerCase()));
      }
      return {
        ...plan,
        _id: plan._id || plan.id || plan.planId || (matchingFallback ? matchingFallback.id : `${nameLower}_plan`),
        id: plan.id || plan._id || plan.planId || (matchingFallback ? matchingFallback.id : `${nameLower}_plan`),
        name: plan.name || (matchingFallback ? matchingFallback.name : "Plan"),
        price: plan.price !== undefined ? Number(plan.price) : (matchingFallback ? matchingFallback.price : 0),
        periodAmount: plan.periodAmount || 1,
        periodUnit: plan.periodUnit || "Month",
        benefits: plan.benefits || (matchingFallback ? matchingFallback.features : []),
        slug: plan.slug || `${nameLower}-plan`,
        recommended: plan.recommended || (matchingFallback ? matchingFallback.recommended : false),
        features: plan.features || plan.benefits || (matchingFallback ? matchingFallback.features : [])
      };
    });
  }, []);

  const handleSelectPlan = (plan) => {
    const storedPlan = {
      ...plan,
      planId: plan._id || plan.id,
      planName: plan.name,
      amount: Number(plan.price)
    };
    console.log("[GrowPlan] Selected Plan", storedPlan);
    setSelectedPlan(storedPlan);
    //setIsFeaturesExpanded(false);
  };

  // Fetch plans, wallet balance, and active subscription on mount
  const initPageData = useCallback(async () => {
    if (!sellerId) {
      setErrorMsg("Seller session not found. Please log in again.");
      setLoadingPlans(false);
      return;
    }

    setLoadingPlans(true);
    setErrorMsg(null);

    try {
      // 1. Fetch Plans
      console.log("[GrowPlanPage] Fetching plans... GET https://haatzaseller.com/_functions/getPlans");
      let planItems = [];
      try {
        const plansRes = await sellerService.getPlans();
        setPlansRes(plansRes);
        console.log("[GrowPlanPage] Get Plans Response", plansRes);
        planItems = extractPlans(plansRes);
      } catch (err) {
        console.error("[GrowPlanPage] Get Plans API error, using fallbacks:", err);
      }
      const finalPlans = mapPlansWithFeatures(planItems);
      setPlans(finalPlans);

      // Pre-select Recommended Pro plan if available
      const recommended = finalPlans.find(p => p.recommended || p.name === "Pro" || p.name === "pro" || p.planName === "Pro" || p.planName === "pro");
      if (recommended) {
        handleSelectPlan(recommended);
      } else if (finalPlans.length > 0) {
        handleSelectPlan(finalPlans[0]);
      }

      // 2. Fetch Wallet Balance
      console.log(`[GrowPlanPage] Fetching wallet balance... GET https://haatza.com/_functions/checkWalletBalance?sellerId=${sellerId}`);
      try {
        const walletRes = await sellerService.checkWalletBalance(sellerId);
        console.log("[GrowPlanPage] Wallet Balance Response", walletRes);
        setWalletBalance(extractWalletBalance(walletRes));
      } catch (err) {
        console.error("[GrowPlanPage] Wallet Balance API error:", err);
      }

      // 3. Fetch Seller Current Subscription
      if (sellerEmail) {
        console.log(`[GrowPlanPage] Fetching active subscription... GET https://haatzaseller.com/_functions/sellersubscription?email=${sellerEmail}`);
        try {
          const subRes = await sellerService.getSellerSubscription(sellerEmail);
          setSubscriptionRes(subRes);
          console.log("[GrowPlanPage] Seller Subscription Response", subRes);
          const orders = extractSubscriptionOrders(subRes);
          if (orders.length > 0) {
            setActiveSubscription(getLatestSubscription(orders));
          }
        } catch (err) {
          console.error("[GrowPlanPage] Seller Subscription API error:", err);
        }

        // 4. Fetch Seller Profile
        console.log(`[GrowPlanPage] Fetching seller profile... GET /sellerdata?email=${sellerEmail}`);
        try {
          const profileRes = await sellerService.getUserProfile(sellerEmail);
          console.log("[GrowPlanPage] Seller Profile Response", profileRes);
          if (profileRes?.status === "success" || profileRes?.message) {
            setSellerProfile(profileRes.message);
          }
        } catch (err) {
          console.error("[GrowPlanPage] Seller Profile API error:", err);
        }
      }

    } catch (err) {
      console.error("[GrowPlanPage] Page initialization error:", err);
      setErrorMsg("Failed to initialize Grow Plan page data.");
    } finally {
      setLoadingPlans(false);
    }
  }, [sellerId, sellerEmail, mapPlansWithFeatures]);

  useEffect(() => {
    initPageData();
  }, [initPageData]);



  const currentPlanName = currentSubscription?.planName || currentSubscription?.plan || currentSubscription?.subscriptionPlan;
  const expiryDate =
    currentSubscription?.endDate ||
    currentSubscription?.endedDate ||
    currentSubscription?.expiryDate ||
    currentSubscription?.expiredOn ||
    currentSubscription?.validTill;

  const expiryDateObj = parseDateSafe(expiryDate);
  const isExpired = expiryDateObj ? expiryDateObj < new Date() : false;

  const isSamePlan = (plan) =>
    plan && normalize(plan.name || plan.planName) === normalize(currentPlanName);

  function getPlanActionLabel(selectedPlan, currentSubscription) {
    if (!selectedPlan) return "";

    if (!currentSubscription) return "Subscribe Plan";

    const isSame =
      selectedPlan.id === currentSubscription.planId ||
      normalize(selectedPlan.name) === normalize(currentSubscription.planName || currentSubscription.plan);

    const now = new Date();
    const endDate = (currentSubscription.endedDate || currentSubscription.endDate)
      ? parseDateSafe(currentSubscription.endedDate || currentSubscription.endDate)
      : null;

    const isExpired = endDate ? endDate < now : false;

    if (isSame && isExpired) return "Renew Plan";
    if (isSame && !isExpired) return "Current Plan";

    return "Upgrade Plan";
  }

  function isActionDisabled(selectedPlan, currentSubscription, isProcessing) {
    if (!selectedPlan || isProcessing) return true;

    const label = getPlanActionLabel(selectedPlan, currentSubscription);
    return label === "Current Plan";
  }

  const handlePlanAction = () => {
    if (!selectedPlan) return;
    navigate("/dashboard/growplan/review", {
      state: {
        selectedPlan,
        currentSubscription,
        plans,
        walletBalance: availableBalance
      }
    });
  };

  // Development logs
  console.log("[GrowPlan] Plans Response", plansRes);
  console.log("[GrowPlan] Seller Subscription Response", subscriptionRes);
  console.log("[GrowPlan] Current Subscription", currentSubscription);
  console.log("[GrowPlan] Current Plan Name", currentPlanName);
  console.log("[GrowPlan] Expiry Date", expiryDate);
  console.log("[GrowPlan] Is Expired", isExpired);

  // Calculations effect
  useEffect(() => {
    if (!selectedPlan) return;

    // 1. baseAmount
    const basePrice = Number(selectedPlan.price || 0);
    setBaseAmount(basePrice);

    // 2. originalTotal
    const multiplier = getDurationMultiplier(planDuration);
    const origTotal = basePrice * multiplier;
    setOriginalTotal(origTotal);

    // 3. remainingAmount
    let remainingVal = 0;
    const isUpgrade = currentSubscription &&
      normalize(selectedPlan.name) !== normalize(currentSubscription.planName || currentSubscription.plan || currentSubscription.subscriptionPlan);

    const oldExpiry = currentSubscription ? parseDateSafe(
      currentSubscription.endDate ||
      currentSubscription.endedDate ||
      currentSubscription.expiryDate ||
      currentSubscription.expiredOn ||
      currentSubscription.validTill
    ) : null;
    const isOldActive = oldExpiry ? oldExpiry > new Date() : false;

    if (isUpgrade && isOldActive) {
      remainingVal = calculateRemainingAmount(currentSubscription);
    }
    setRemainingAmount(remainingVal);

    // 4. totalPayableAmount before wallet
    let payable = origTotal - remainingVal - discountAmount;
    if (payable < 0) payable = 0;

    // 5. walletUsedAmount & totalPayableAmount after wallet
    let walletUsed = 0;
    if (useWallet) {
      walletUsed = Math.min(availableBalance, payable);
      payable = payable - walletUsed;
    }
    setWalletUsedAmount(walletUsed);
    setTotalPayableAmount(payable);

    // 6. startedDate and endedDate
    let startD = new Date();
    const isRenew = currentSubscription &&
      normalize(selectedPlan.name) === normalize(currentSubscription.planName || currentSubscription.plan || currentSubscription.subscriptionPlan);

    if (isRenew && isOldActive) {
      startD = new Date(oldExpiry.getTime());
      startD.setDate(startD.getDate() + 1);
    }

    const startIso = startD.toISOString().split('.')[0] + 'Z';
    setStartedDate(startIso);

    const monthsToAdd = getDurationMonths(planDuration);
    const endD = new Date(startD.getTime());
    endD.setMonth(endD.getMonth() + monthsToAdd);
    endD.setDate(endD.getDate() - 1);
    const endIso = endD.toISOString().split('.')[0] + 'Z';
    setEndedDate(endIso);

  }, [selectedPlan, currentSubscription, planDuration, useWallet, discountAmount, availableBalance]);

  const payableAmount = totalPayableAmount;

  // Handle Referral Check
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;

    setCheckingReferral(true);
    setReferralMessage({ text: "", type: "" });
    setReferralDiscount(0);
    setAppliedReferralCode("");
    setIsCouponApplied(false);

    const enteredCode = referralCode.trim();

    console.log("[GrowPlanPage] Checking referral code:", enteredCode);

    try {
      const res = await sellerService.referralCheck(enteredCode);
      console.log("[GrowPlanPage] Referral Check Response:", res);

      const isValid = res?.message?.valid === true || res?.valid === true;
      const discountVal = Number(res?.message?.rewardAmount || res?.message?.discount || res?.message?.amount || res?.rewardAmount || res?.discount || 0);

      if (isValid) {
        setReferralDiscount(discountVal);
        setAppliedReferralCode(enteredCode);
        setIsCouponApplied(true);
        setReferralMessage({
          text: `Referral code applied successfully! Saved ₹${discountVal}.`,
          type: "success"
        });
        showToast("Coupon applied successfully");
      } else {
        setReferralMessage({
          text: "Invalid referral code.",
          type: "error"
        });
        showToast("Invalid coupon");
      }
    } catch (err) {
      console.error("[GrowPlanPage] Referral check error:", err);
      setReferralMessage({
        text: "Failed to verify referral code.",
        type: "error"
      });
      showToast("Invalid coupon");
    } finally {
      setCheckingReferral(false);
    }
  };

  // Process subscription flow
  const handleProceedSubscription = async () => {
    setShowConfirmModal(false);

    if (paymentInProgressRef.current) {
      console.warn("[GrowPlanPage] A payment or subscription process is already running. Skipping duplicate call.");
      return;
    }

    // Validation
    if (!selectedPlan) {
      setErrorMsg("Validation failed: selectedPlan is missing");
      return;
    }
    if (!sellerId || !sellerEmail) {
      setErrorMsg("Validation failed: sellerId or sellerEmail is missing");
      return;
    }
    if (isNaN(totalPayableAmount) || totalPayableAmount < 0) {
      setErrorMsg("Validation failed: totalPayableAmount is invalid");
      return;
    }

    paymentInProgressRef.current = true;
    setIsProcessingPayment(true);
    setPaymentStatus("processing");
    setErrorMsg(null);

    console.log("[GrowPlan] selectedPlan:", selectedPlan);
    console.log("[GrowPlan] calculated amount:", totalPayableAmount);

    try {
      // Step 4 of Validation: If totalPayableAmount is 0 and walletUsedAmount > 0, skip Razorpay
      if (totalPayableAmount === 0 && walletUsedAmount > 0) {
        await completeSubscriptionActivation("wallet_payment", "wallet_order");
        return;
      }

      // Otherwise, proceed with Razorpay payment
      setProcessingMessage("Creating payment order...");

      const createOrderPayload = {
        amount: Math.round(totalPayableAmount),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
      };

      console.log("[GrowPlan] createRazorpayOrder payload:", createOrderPayload);
      const orderRes = await sellerService.createRazorpayOrder(createOrderPayload);
      console.log("[GrowPlan] Razorpay order response:", orderRes);

      const orderData = orderRes?.message?.order;
      const razorpayOrderId = orderData?.id;
      const razorpayKey = orderRes?.message?.keyId;
      const currency = orderData?.currency || "INR";

      if (!razorpayOrderId || !razorpayKey) {
        throw new Error("Razorpay order creation failed: keyId or order id is missing.");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay payment SDK failed to load.");
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        name: "Haatza India Private Limited",
        order_id: razorpayOrderId,
        description: sellerId,
        handler: async function (razorpayResponse) {
          console.log("[GrowPlan] Razorpay Success Response:", razorpayResponse);

          setPaymentStatus("updating_subscription");
          setViewState("success");
          setProcessingMessage("Verifying payment...");

          try {
            const verifyPayload = {
              orderId: razorpayResponse.razorpay_order_id,
              paymentId: razorpayResponse.razorpay_payment_id,
              signature: razorpayResponse.razorpay_signature
            };

            console.log("[GrowPlan] verify payment payload:", verifyPayload);
            const verifyRes = await sellerService.verifyRazorpayPayment(verifyPayload);
            console.log("[GrowPlan] verify payment response:", verifyRes);

            const verified = verifyRes?.status === "success" && verifyRes?.message?.verified === true;
            if (!verified) {
              throw new Error("Payment verification failed");
            }

            await completeSubscriptionActivation(
              razorpayResponse.razorpay_payment_id,
              razorpayResponse.razorpay_order_id
            );

          } catch (verifyErr) {
            console.error("[GrowPlan] Verification/Activation error:", verifyErr);
            setPaymentStatus("refund");
            setSubscriptionWarning("Payment received but subscription was not activated. Please contact support.");
            setIsProcessingPayment(false);
            paymentInProgressRef.current = false;
          }
        },
        prefill: {
          name: sellerProfile?.name || sellerProfile?.companyName || "",
          email: sellerEmail || "",
          contact: sellerProfile?.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("[GrowPlanPage] Razorpay modal dismissed by user.");
            setIsProcessingPayment(false);
            paymentInProgressRef.current = false;
            setErrorMsg("Payment checkout cancelled.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        console.error("[GrowPlanPage] Razorpay Payment failed:", resp.error);
        setIsProcessingPayment(false);
        paymentInProgressRef.current = false;
        setErrorMsg(resp.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();

    } catch (err) {
      console.error("[GrowPlanPage] Subscription initiation error:", err);
      setErrorMsg(err.message || "Failed to subscribe. Please try again.");
      setIsProcessingPayment(false);
      paymentInProgressRef.current = false;
    }
  };

  const completeSubscriptionActivation = async (paymentId, orderId) => {
    try {
      setProcessingMessage("Activating subscription...");

      // GST calculation
      const basePrice = Number(originalTotal);
      const gstRate = 10;
      const gstAmount = basePrice * gstRate / 100;
      const rate = basePrice - gstAmount;

      const basePriceMinusGst = Math.round(rate);
      const calculatedGst = Math.round(gstAmount);

      const invoiceData = {
        invoiceDate: new Date().toISOString(),
        sellerName: sellerProfile?.companyName || sellerProfile?.name || "",
        sellerId: sellerId,
        address: `${sellerProfile?.address || ""}, ${sellerProfile?.pincode || ""}`,
        gstin: sellerProfile?.gstin || sellerProfile?.GSTIN || "",
        item: selectedPlan.name,
        qty: 1,
        rate: basePriceMinusGst,
        amount: basePriceMinusGst,
        subtotal: basePriceMinusGst,
        cgst: calculatedGst / 2,
        sgst: calculatedGst / 2,
        totalPayable: totalPayableAmount,
        payments: {
          wallet: walletUsedAmount,
          upi: totalPayableAmount
        },
        transactionMethod: (useWallet && totalPayableAmount === 0)
          ? "Wallet"
          : useWallet
            ? "Wallet, UPI"
            : "UPI"
      };

      // Determine tableId and subscription update mode
      const isRenew = currentSubscription &&
        normalize(selectedPlan.name) === normalize(currentSubscription.planName || currentSubscription.plan || currentSubscription.subscriptionPlan);

      const isUpgrade = currentSubscription && !isRenew;

      const oldExpiry = currentSubscription ? parseDateSafe(
        currentSubscription.endDate ||
        currentSubscription.endedDate ||
        currentSubscription.expiryDate ||
        currentSubscription.expiredOn ||
        currentSubscription.validTill
      ) : null;
      const isOldActive = oldExpiry ? oldExpiry > new Date() : false;

      const isSameStartDate = currentSubscription && (() => {
        const oldStart = parseDateSafe(currentSubscription.startedDate || currentSubscription.startDate);
        return oldStart && oldStart.toDateString() === new Date().toDateString();
      })();

      // Date split for upgrade
      if (isUpgrade && isOldActive && !isSameStartDate) {
        setProcessingMessage("Terminating previous subscription...");
        const endOldPayload = {
          createSellerInvoice: {},
          createSubscription: {
            tableId: currentSubscription.TableID || currentSubscription.tableId || currentSubscription._id || "",
            planName: currentSubscription.planName || currentSubscription.plan || "",
            planId: currentSubscription.planId || currentSubscription.id || "",
            status: "Expired",
            email: sellerEmail,
            startedDate: currentSubscription.startedDate || currentSubscription.startDate,
            endedDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] + 'Z', // yesterday
            paymentId: currentSubscription.paymentId || "",
            razorpayOrderId: currentSubscription.razorpayOrderId || currentSubscription.orderId || "",
            sellerId: sellerId,
            phone: currentSubscription.phone || sellerProfile?.phone || ""
          },
          referralUpdate: {
            rewardEarned: 0,
            rewardUsed: 1,
            referralCode: ""
          }
        };
        console.log("[GrowPlan] Terminating old subscription payload:", endOldPayload);
        await sellerService.processSubscriptionOrder(endOldPayload);
      }

      // Build subscription payload
      const subPayload = {
        tableId: (isRenew || (isUpgrade && isSameStartDate))
          ? (currentSubscription.TableID || currentSubscription.tableId || currentSubscription._id || "")
          : "",
        planName: selectedPlan.name,
        planId: selectedPlan.id,
        status: "Active",
        email: sellerEmail,
        startedDate: startedDate,
        endedDate: endedDate,
        paymentId: paymentId,
        razorpayOrderId: orderId,
        sellerId: sellerId,
        phone: sellerProfile?.phone || ""
      };

      const referralPayload = {
        rewardEarned: discountAmount,
        rewardUsed: 1,
        referralCode: couponCode || ""
      };

      const storePayload = {
        createSellerInvoice: invoiceData,
        createSubscription: subPayload,
        referralUpdate: referralPayload
      };

      console.log("[GrowPlan] processSubscriptionOrder payload:", storePayload);
      const storeRes = await sellerService.processSubscriptionOrder(storePayload);
      console.log("[GrowPlan] processSubscriptionOrder response:", storeRes);

      const success = storeRes?.status === "success" &&
        storeRes?.message?.message === "Subscription order processed successfully";

      if (!success) {
        throw new Error(storeRes?.message?.error || "Subscription activation failed on backend.");
      }

      setPaymentStatus("success");
      showToast("Subscription successful!");

      // Refetch subscription and wallet in background
      try {
        const subRes = await sellerService.getSellerSubscription(sellerEmail);
        setSubscriptionRes(subRes);
        const orders = extractSubscriptionOrders(subRes);
        if (orders.length > 0) {
          setCurrentSubscription(getLatestSubscription(orders));
        }
      } catch (err) {
        console.error("[GrowPlanPage] Refetch subscription failed:", err);
      }

      try {
        const walletRes = await sellerService.checkWalletBalance(sellerId);
        setAvailableBalance(extractWalletBalance(walletRes));
      } catch (err) {
        console.error("[GrowPlanPage] Refetch wallet balance failed:", err);
      }

      setViewState("success");

    } catch (err) {
      console.error("[GrowPlanPage] Activation failed:", err);
      setPaymentStatus("refund");
      setSubscriptionWarning("Payment received but subscription was not activated. Please contact support.");
    } finally {
      setIsProcessingPayment(false);
      paymentInProgressRef.current = false;
    }
  };

  const handleResetFlow = () => {
    setViewState("plans");
    setRedeemWallet(false);
    setReferralCode("");
    setAppliedReferralCode("");
    setReferralDiscount(0);
    setReferralMessage({ text: "", type: "" });
    setErrorMsg(null);
    setSubscriptionWarning("");
    setPaymentStatus("");
  };

  if (loadingPlans) {
    return (
      <div className="grow-plan-container">
        <div className="grow-loading-overlay">
          <div className="grow-loading-spinner" />
          <p>Loading plans and billing status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grow-plan-container ${selectedPlan ? "has-sticky-action" : ""}`}>
      {toastMessage && (
        <div className="grow-success-banner" style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46", padding: "12px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", border: "1px solid" }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: "none", border: "none", color: "#047857", cursor: "pointer", fontWeight: "bold" }}>&times;</button>
        </div>
      )}
      <div className="grow-plan-breadcrumb">
        <span>Dashboard</span> &gt; <span className="active">Grow Plan</span>
      </div>

      <div className="grow-plan-header">
        <h1>Grow Plan</h1>
        <h2 className="grow-plan-subtitle">Power Up Your Business with Haatza Seller Plans</h2>
        <p className="grow-plan-description">
          The Haatza Seller App is designed to empower sellers at every stage — whether you're starting small or scaling up rapidly. Our pricing plans are crafted to give you the tools you need to sell better, grow faster, and manage smarter.
        </p>
      </div>

      {errorMsg && (
        <div className="grow-error-banner">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}>&times;</button>
        </div>
      )}

      {/* Grid of pricing cards stacked in a list */}
      <div className="plans-list">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          //const featuresToShow = isFeaturesExpanded
          //  ? plan.features
          //  : plan.features?.slice(0, 5);
          const isExpanded = !!expandedPlans[plan.id];
          const featuresToShow = isExpanded
            ? plan.features
            : plan.features?.slice(0, 5);
          const hasLongFeatures = plan.features?.length > 5;



          return (
            <div
              className={`plan-card ${isSelected ? "selected" : ""} ${plan.recommended ? "recommended" : ""}`}
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
            >
              <div className="plan-card-header">
                <div className="plan-name-wrapper">
                  <span className="plan-name">{plan.name}</span>
                  {plan.recommended && (
                    <span className="recommended-badge-inline">Recommended</span>
                  )}
                </div>
                <div className="plan-selector-radio">
                  <div className="plan-selector-inner" />
                </div>
              </div>

              <div className="plan-price-row">
                <span className="plan-price">₹{plan.price.toLocaleString("en-IN")}</span>
                <span className="plan-duration"> / month</span>
              </div>

              {isSamePlan(plan) && expiryDate && (
                <div className={isExpired ? "current-plan-expired-text" : "current-plan-active-text"}>
                  {isExpired
                    ? `Current plan expired on: ${formatPlanDate(expiryDate)}`
                    : `Current plan active till: ${formatPlanDate(expiryDate)}`}
                </div>
              )}



              {/* {isSelected && (
                <div className="plan-expanded-details">
                  <div className="plan-divider" />
                  <div className="plan-features-title">What's included:</div>
                  <ul className="plan-features-list">
                    {featuresToShow?.map((feat, idx) => (
                      <li className="plan-feature-item" key={idx}>
                        <CheckCircle2 size={16} className="feature-check-icon" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  {hasLongFeatures && (
                    <button
                      className="btn-see-more-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFeaturesExpanded(!isFeaturesExpanded);
                      }}
                    >
                      {isFeaturesExpanded ? "See less" : "See more"}
                    </button>
                  )}
                </div>
              )} */}

              <div className="plan-expanded-details">
                <div className="plan-divider" />
                <div className="plan-features-title">What's included:</div>
                <ul className="plan-features-list">
                  {featuresToShow?.map((feat, idx) => (
                    <li className="plan-feature-item" key={idx}>
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                {hasLongFeatures && (
                  <button
                    className="btn-see-more-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPlans((prev) => ({
                        ...prev,
                        [plan.id]: !prev[plan.id]
                      }));
                    }}
                  >
                    {isExpanded ? "See less" : "See more"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Information below plan cards */}
      <div className="grow-plan-footer-content">
        <div className="footer-section">
          <h3>Built for Sellers Who Want More</h3>
          <p>
            The Haatza Seller App is more than just a selling tool — it's your growth partner. Whether you're listing your first product or managing thousands of orders a month, our subscription plans are designed to help you sell smarter, grow faster, and operate effortlessly.
          </p>
        </div>
        <div className="footer-section">
          <h3>Scalable Plans, Sustainable Growth</h3>
          <p>
            Your business isn't one-size-fits-all — and neither are we. Our flexible pricing adapts to your goals, giving you access to the right tools when you need them most — from entry-level essentials to advanced features that drive big results.
          </p>
        </div>
        <div className="footer-section">
          <h3>Let’s Build Your Business Together</h3>
          <p>
            Start with our free plan to test the waters or jump right into Growth or Pro to supercharge your performance.
          </p>
        </div>
      </div>

      {/* Sticky Bottom selection indicator bar */}
      {selectedPlan && (
        <div className="grow-plan-sticky-footer">
          <div className="grow-plan-sticky-action">
            <div className="grow-plan-sticky-left">
              <div style={{ fontWeight: "700", fontSize: "16px", color: "#1e293b" }}>
                Selected: {selectedPlan.name} &bull; ₹{selectedPlan.price.toLocaleString("en-IN")}/month
              </div>
              {currentPlanName && (
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>
                  Current plan: {currentPlanName}
                </div>
              )}
            </div>
            <div className="grow-plan-sticky-right">
              <button
                onClick={handlePlanAction}
                disabled={isActionDisabled(selectedPlan, currentSubscription, false)}
                className="btn-review-upgrade-cta"
                style={{
                  minWidth: "160px",
                  height: "46px",
                  backgroundColor: isActionDisabled(selectedPlan, currentSubscription, false) ? "#cbd5e1" : "#2962ff",
                  color: "#ffffff",
                  fontWeight: "700",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isActionDisabled(selectedPlan, currentSubscription, false) ? "not-allowed" : "pointer"
                }}
              >
                {getPlanActionLabel(selectedPlan, currentSubscription)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowPlanPage;
