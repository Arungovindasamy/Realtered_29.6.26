import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Warehouse, CheckCircle2, Phone, Mail, Globe,
  Zap, RotateCcw, BarChart2, Layers, Loader2, Package,
  ClipboardList, RefreshCw, HeadphonesIcon, AtSign,
  Hash, Smartphone, FileText, MapPin,
  ClipboardCheck, TrendingUp, DollarSign, Search,
} from "lucide-react";
import "./WarehouseGetStarted.css";
import { sellerService } from "../../services/sellerService";
const LOCATIONS = ["Bangalore", "Chennai"];

const SERVICES = [
  { icon: Package,        name: "Inventory Management", desc: "Track stock levels and receive alerts for low stock." },
  { icon: ClipboardList,  name: "Order Fulfillment",     desc: "Picking, packing, and shipping support for timely delivery." },
  { icon: RefreshCw,      name: "Returns Processing",    desc: "Efficient handling of returns and exchanges." },
  { icon: BarChart2,      name: "Reporting & Analytics", desc: "Access detailed reports on inventory and order history." },
  { icon: HeadphonesIcon, name: "Customer Support",      desc: "Dedicated warehouse assistance team available for you." },
];

const NEXT_STEPS = [
  { icon: Search,        title: "Request Review",        desc: "Our team reviews your request and gets back to you shortly." },
  { icon: ClipboardCheck,title: "Business Consultation", desc: "We discuss your requirements and craft a customized solution." },
  { icon: DollarSign,    title: "Flexible Pricing",      desc: "Plans suitable for both small sellers and large enterprises." },
  { icon: TrendingUp,    title: "Business Growth",       desc: "Reduce costs and focus on scaling your business." },
];

export default function WarehouseGetStarted({
  sellerId,
  email,
  phone,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get("edit") === "true" || location.state?.edit === true || location.state?.isEdit === true;

  const resolvedSellerId = sellerId || sellerService.getCachedSellerId();

  const touchStartPos = useRef(null);
  const isScrollingRef = useRef(false);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isScrollingRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartPos.current && e.touches && e.touches[0]) {
      const diffX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
      const diffY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
      if (diffX > 10 || diffY > 10) {
        isScrollingRef.current = true;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (isScrollingRef.current) {
      e.preventDefault();
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
    touchStartPos.current = null;
  };
  const resolvedEmail    = email    || sellerService.getCachedSellerEmail();
  const resolvedPhone    = phone    || sellerService.getCachedSellerPhone();

  const [form, setForm] = useState({
    sellerId: resolvedSellerId || "",
    email: resolvedEmail || "",
    relatedEmail: "",
    phone: resolvedPhone || "",
    gstin: "",
    locations: [],
    location: "",
    gstState: "",
    dsc: "",
    address: "",
    warehouseName: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const toggle = (field, value) =>
    setForm((f) => {
      const nextList = f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value];
      if (errors.locations && nextList.length > 0) {
        setErrors((prev) => ({ ...prev, locations: "" }));
      }
      return {
        ...f,
        [field]: nextList,
        location: (nextList && nextList[0]) || "",
      };
    });

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!resolvedEmail) return;
      try {
        const res = await sellerService.getUserProfile(resolvedEmail, resolvedSellerId);
        if (!active) return;
        const p = res?.message || res?.data || res || {};
        let onboardingData = p.seller || p.data || p;
        if (Array.isArray(onboardingData)) {
          onboardingData = onboardingData[0] || {};
        }
        if (onboardingData && Object.keys(onboardingData).length > 0) {
          const loadedLocation = onboardingData.location || onboardingData.warehouseLocation || onboardingData.enrollLocation || (onboardingData.locations && onboardingData.locations[0]) || (onboardingData.warehouseLocations && onboardingData.warehouseLocations[0]) || "";
          
          let dbGst = onboardingData.gstState || onboardingData.gstVerification || onboardingData.kamRegistration;
          if (dbGst === true || dbGst === "true" || dbGst === "Yes") {
            dbGst = "Yes";
          } else if (dbGst === false || dbGst === "false" || dbGst === "No") {
            dbGst = "No";
          } else {
            dbGst = "";
          }

          let dbDsc = onboardingData.dsc || onboardingData.dscVerification || onboardingData.digitalSignature;
          if (dbDsc === true || dbDsc === "true" || dbDsc === "Yes") {
            dbDsc = "Yes";
          } else if (dbDsc === false || dbDsc === "false" || dbDsc === "No") {
            dbDsc = "No";
          } else {
            dbDsc = "";
          }

          let dbLocations = [];
          if (typeof loadedLocation === "string" && loadedLocation.trim() !== "") {
            dbLocations = loadedLocation.split(",").map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(loadedLocation)) {
            dbLocations = loadedLocation;
          }

          setForm((f) => ({
            ...f,
            sellerId: onboardingData.sellerId || onboardingData.seller_id || f.sellerId,
            email: onboardingData.email || f.email,
            phone: onboardingData.phone || onboardingData.phone_number || f.phone,
            relatedEmail: onboardingData.relatedEmail || onboardingData.alternateEmail || f.relatedEmail || "",
            gstin: onboardingData.GSTIN || onboardingData.gstin || f.gstin || "",
            location: isEditMode ? (dbLocations[0] || "") : "",
            locations: isEditMode ? dbLocations : [],
            gstState: isEditMode ? dbGst : "",
            dsc: isEditMode ? dbDsc : "",
            address: onboardingData.address || f.address || "",
            warehouseName: onboardingData.companyName || onboardingData.warehouseName || f.warehouseName || "",
          }));
        }
      } catch (err) {
        console.warn("[WarehouseGetStarted] Failed to load seller profile for persistence:", err);
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, [resolvedEmail, resolvedSellerId]);

  const validateForm = () => {
    const newErrors = {};
    const hasLocation = form.location || (form.locations && form.locations.length > 0);
    if (!hasLocation) {
      newErrors.locations = "Please select a Warehouse Location";
    }
    if (!form.gstState) {
      newErrors.gstState = "Please select GST Verification";
    }
    if (!form.dsc) {
      newErrors.dsc = "Please select DSC Verification";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const locStr = form.locations && form.locations.length > 0 
        ? form.locations.join(", ") 
        : (form.location || "");

      const gstVerification = form.gstState;
      const dscVerification = form.dsc;

      const formData = {
        warehouseLocation: locStr,
        dscVerification: dscVerification === "Yes"
      };

      // Before API submission: log the Warehouse Location
      console.log("Warehouse Location:", formData.warehouseLocation);

      // Verify that Warehouse Location is not undefined, null, or empty
      if (
        formData.warehouseLocation === undefined ||
        formData.warehouseLocation === null ||
        formData.warehouseLocation === ""
      ) {
        console.error("[WarehouseGetStarted] Validation failed: warehouseLocation is empty, null, or undefined.", { warehouseLocation: formData.warehouseLocation });
        alert("Validation error: Warehouse Location must not be empty.");
        setLoading(false);
        return;
      }

      const payload = {
        sellerId: form.sellerId,
        email: form.email,
        phone: form.phone,
        phoneNumber: form.phone, // Direct key for database Phone Number column
        relatedEmail: form.relatedEmail,
        gstin: form.gstin,
        
        // Warehouse Location mappings
        warehouseLocation: formData.warehouseLocation,
        enrollLocation: formData.warehouseLocation, // Direct Wix CMS key

        // GST Verification mappings
        gstVerification: gstVerification === "Yes",
        kamRegistration: gstVerification === "Yes", // Direct Wix CMS key

        // DSC Verification mappings
        dsc: dscVerification === "Yes", // Direct Wix CMS key for Digital Signature column
        dscVerification: dscVerification === "Yes",
        digitalSignature: dscVerification === "Yes", // Direct Wix CMS key

        address: form.address || "",
        warehouseName: form.warehouseName || "",
        requestType: "Storage",
      };

      // Before API submission: log validation values
      console.log("Warehouse Request Payload:", payload);

      const response = await sellerService.submitWarehouseRequest(payload);
      console.log("[WarehouseGetStarted] submitWarehouseRequest Response:", response);

      const responseStatus = response?.status;
      const responseId = response?._id || response?.message?._id || response?.data?._id;

      if (responseStatus === "success" && responseId) {
        try {
          await sellerService.updateSellerOnboarding(form.email, {
            locations: form.locations,
            warehouseLocations: form.locations,
            warehouseLocation: formData.warehouseLocation,
            enrollLocation: formData.warehouseLocation,
            location: formData.warehouseLocation,
            gstState: form.gstState,
            gstVerification: gstVerification === "Yes",
            kamRegistration: gstVerification === "Yes",
            dsc: form.dsc,
            dscVerification: dscVerification === "Yes",
            digitalSignature: dscVerification === "Yes",
            address: form.address,
            companyName: form.warehouseName,
          });
        } catch (updateErr) {
          console.warn("[WarehouseGetStarted] Failed to update seller onboarding details:", updateErr);
        }
        navigate("/dashboard");
      } else {
        throw new Error("Invalid API response status or missing request ID.");
      }
    } catch (err) {
      console.error("[WarehouseGetStarted] Submit failed:", err);
      alert(err?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* ── Header ── */}
      {/* ── Back Button ── */}
<div className="page-topbar">
  <button className="back-btn" onClick={() => window.history.back()}>
    <ArrowLeft size={16} />
    Back to Warehouse
  </button>
</div>

      <div className="body">
        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-badge">
            <span className="hero-dot" />
            Active Enrollments Open
          </div>
          <div className="hero-title">Warehouse Services</div>
          <div className="hero-sub">
            Professional inventory storage, fulfillment, returns management, and dedicated warehouse support for Haatza sellers.
          </div>
          <div className="hero-pills">
            {[
              { icon: Zap,       label: "Faster Dispatch" },
              { icon: RotateCcw, label: "Reduced RTO" },
              { icon: Layers,    label: "Inventory Control" },
              { icon: BarChart2, label: "Scalable Ops" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="hero-pill">
                <Icon size={12} /> {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Services ── */}
        <div className="card">
          <div className="card-title">Services Offered</div>
          <div className="card-sub">Everything you need to fulfill orders and grow your business</div>
          <div className="services-grid">
            {SERVICES.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="svc-card">
                <div className="svc-icon"><Icon size={20} /></div>
                <div className="svc-name">{name}</div>
                <div className="svc-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Seller Details ── */}
        <div className="card">
          <div className="card-title">Seller Details</div>
          <div className="card-sub">Your account information for enrollment</div>
          <div className="form-grid">
            <div className="field">
              <div className="field-label">Seller ID <span className="field-req">*</span></div>
              <div className="input-wrap">
                <span className="input-icon"><Hash size={15} /></span>
                <input
                  className="input"
                  placeholder="SELL-000123"
                  value={form.sellerId}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, sellerId: e.target.value }));
                    if (errors.sellerId) setErrors((prev) => ({ ...prev, sellerId: "" }));
                  }}
                />
              </div>
              {errors.sellerId && <div className="error-message">{errors.sellerId}</div>}
            </div>
            <div className="field">
              <div className="field-label">Email <span className="field-req">*</span></div>
              <div className="input-wrap">
                <span className="input-icon"><AtSign size={15} /></span>
                <input
                  className="input"
                  placeholder="seller@example.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="field">
              <div className="field-label">Related Email</div>
              <div className="input-wrap">
                <span className="input-icon"><Mail size={15} /></span>
                <input
                  className="input"
                  placeholder="alternate@email.com"
                  value={form.relatedEmail}
                  onChange={(e) => setForm((f) => ({ ...f, relatedEmail: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <div className="field-label">Phone Number <span className="field-req">*</span></div>
              <div className="input-wrap">
                <span className="input-icon"><Smartphone size={15} /></span>
                <input
                  className="input"
                  placeholder="+91 00000 00000"
                  value={form.phone}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, phone: e.target.value }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                />
              </div>
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            <div className="field">
              <div className="field-label">GSTIN</div>
              <div className="input-wrap">
                <span className="input-icon"><FileText size={15} /></span>
                <input
                  className="input"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Warehouse Locations ── */}
        <div className="card">
          <div className="card-title">Warehouse Locations <span className="required-asterisk">*</span></div>
          <div className="card-sub">Choose the locations you'd like to enroll with Haatza</div>
          <div className="loc-grid">
            {LOCATIONS.map((loc) => {
              const sel = form.locations.includes(loc);
              return (
                <button
                  type="button"
                  key={loc}
                  className={`loc-card ${sel ? "loc-card-sel" : ""}`}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isScrollingRef.current) return;
                    toggle("locations", loc);
                  }}
                >
                  <MapPin size={18} className="loc-pin" />
                  {loc}
                  {sel
                    ? <span className="loc-check"><CheckCircle2 size={14} /></span>
                    : <span className="loc-circle" />
                  }
                </button>
              );
            })}
          </div>
          {errors.locations && <div className="error-message">{errors.locations}</div>}
        </div>

        {/* ── GST + DSC Verification ── */}
        <div className="verify-row">
          <div className="card">
            <div className="card-title">GST Verification <span className="required-asterisk">*</span></div>
            <div className="card-sub">Is your GST registered in the KAM-recommended state?</div>
            <div className="radio-row">
              {["Yes", "No"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`radio-card ${form.gstState === opt ? "radio-sel" : ""}`}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isScrollingRef.current) return;
                    const nextVal = form.gstState === opt ? "" : opt;
                    setForm((f) => ({ ...f, gstState: nextVal }));
                    if (errors.gstState && nextVal) setErrors((prev) => ({ ...prev, gstState: "" }));
                  }}
                >
                  {form.gstState === opt && <CheckCircle2 size={16} />}
                  {opt === "Yes" ? "✓  Yes" : "✗  No"}
                </button>
              ))}
            </div>
            {errors.gstState && <div className="error-message">{errors.gstState}</div>}
          </div>

          <div className="card">
            <div className="card-title">DSC Verification <span className="required-asterisk">*</span></div>
            <div className="card-sub">Is a Digital Signature Certificate (DSC) available with you?</div>
            <div className="radio-row">
              {["Yes", "No"].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`radio-card ${form.dsc === opt ? "radio-sel" : ""}`}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isScrollingRef.current) return;
                    const nextVal = form.dsc === opt ? "" : opt;
                    setForm((f) => ({ ...f, dsc: nextVal }));
                    if (errors.dsc && nextVal) setErrors((prev) => ({ ...prev, dsc: "" }));
                  }}
                >
                  {form.dsc === opt && <CheckCircle2 size={16} />}
                  {opt === "Yes" ? "✓  Yes" : "✗  No"}
                </button>
              ))}
            </div>
            {errors.dsc && <div className="error-message">{errors.dsc}</div>}
          </div>
        </div>

        {/* ── What Happens Next ── */}
        <div className="card">
          <div className="card-title">What Happens Next?</div>
          <div className="card-sub">Here's how your onboarding journey unfolds</div>
          <div className="steps-grid">
            {NEXT_STEPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="step-card">
                <div className="step-icon"><Icon size={18} /></div>
                <div className="step-title">{title}</div>
                <div className="step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="card info-card">
          <div className="info-accent" />
          <div className="info-card-inner">
            <div className="card-title">Need Help?</div>
            <div className="card-sub">Our warehouse team is ready to assist you</div>
            <div className="contact-list">
              <a href="mailto:warehouse@haatza.com" className="contact-item">
                <span className="contact-icon"><Mail size={16} /></span>
                warehouse@haatza.com
              </a>
              <a href="tel:+919148079015" className="contact-item">
                <span className="contact-icon"><Phone size={16} /></span>
                +91 914 807 9015
              </a>
              <a href="https://www.haatzaseller.com" target="_blank" rel="noreferrer" className="contact-item">
                <span className="contact-icon"><Globe size={16} /></span>
                www.haatzaseller.com
              </a>
            </div>
          </div>
        </div>

        {/* ── Submit (desktop) ── */}
        {/* ── Submit (desktop) ── */}
        <div className="submit-wrap">
          <button className="submit-btn submit-desktop" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 size={18} className="spin" /> Processing…</> : "Request Service"}
          </button>
        </div>
      </div>
    </div>
  );
}