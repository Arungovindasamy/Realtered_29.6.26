import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./ReferralFaq.css";

const FAQ_DATA = [
  {
    question: "How many sellers can I refer?",
    answer: "There is no limit on referrals."
  },
  {
    question: "When do I receive my referral reward?",
    answer: "After the referred seller completes their first subscription purchase."
  },
  {
    question: "How do I share my referral code?",
    answer: "Use WhatsApp, Email, or Copy Link options available on this page."
  },
  {
    question: "Can I refer an existing seller?",
    answer: "No. Referral rewards apply only to new sellers."
  },
  {
    question: "Can referral rewards be transferred?",
    answer: "No. Rewards belong to the referring seller account."
  }
];

export default function ReferralFaq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {FAQ_DATA.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div key={index} className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
              <button 
                className="faq-question-btn" 
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-toggle-icon">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              <div className="faq-answer-wrapper">
                <div className="faq-answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
