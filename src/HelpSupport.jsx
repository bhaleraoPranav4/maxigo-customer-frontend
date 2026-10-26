
import React, { useState } from "react";
import "./HelpSupport.css";

const SUPPORT_PHONE = "9067662027";
const SUPPORT_EMAIL = "bhaleraopranav631@gmail.com";
const SUPPORT_ADDRESS = "SHEVGAON, GEVRAI ROAD";

const helpTopics = [
  {
    icon: "📦",
    title: "Order & Delivery",
    description: "Order status, delayed delivery, missing or incorrect items."
  },
  {
    icon: "💳",
    title: "Payment & Refund",
    description: "Payment failures, duplicate payments and refunds."
  },
  {
    icon: "👤",
    title: "Account & Login",
    description: "Account access, OTP and profile-related issues."
  },
  {
    icon: "🎟️",
    title: "Offers & Referral",
    description: "Help with coupons, offers and referral rewards."
  }
];

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Open the Orders section in MaxiGo and select your order to view its status and available tracking details."
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Open your order details and check whether cancellation is available for its current status. Contact MaxiGo Support if you need help."
  },
  {
    question: "What should I do if my payment fails?",
    answer:
      "Check your payment status before trying again. If money was deducted, contact support with your order details and payment reference."
  },
  {
    question: "How do I contact MaxiGo?",
    answer:
      "Call Customer Care, contact us on WhatsApp, or send an email using the options on this page."
  }
];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  const openWhatsApp = (text) => {
    const url = `https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(
      text
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const submitComplaint = (event) => {
    event.preventDefault();

    if (!selectedTopic || !message.trim()) {
      alert("Please select a topic and describe your issue.");
      return;
    }

    const complaintText = [
      "Hello MaxiGo Support,",
      `Issue: ${selectedTopic}`,
      `Order ID: ${orderId.trim() || "Not provided"}`,
      `Details: ${message.trim()}`
    ].join("\n");

    openWhatsApp(complaintText);
  };

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SUPPORT_ADDRESS}, Maharashtra, India`
  )}`;

  return (
    <main className="maxigo-help">
      <header className="help-header">
        <div>
          <span className="help-eyebrow">
            MAXIGO CUSTOMER CARE
          </span>
          <h1>Help &amp; Support</h1>
          <p>
            We are here to help you with your MaxiGo experience.
          </p>
        </div>

        <div className="help-header-icon" aria-hidden="true">
          🎧
        </div>
      </header>

      <section
        className="help-contact-grid"
        aria-label="Contact support"
      >
        <article className="help-contact-card">
          <div className="help-contact-icon">📞</div>
          <h2>Call Customer Care</h2>
          <p>
            <a href={`tel:${SUPPORT_PHONE}`}>
              {SUPPORT_PHONE}
            </a>
          </p>

          <a
            className="help-btn help-btn-primary"
            href={`tel:${SUPPORT_PHONE}`}
          >
            Call MaxiGo
          </a>
        </article>

        <article className="help-contact-card">
          <div className="help-contact-icon">💬</div>
          <h2>WhatsApp Support</h2>
          <p>Chat with our support team</p>

          <button
            className="help-btn help-btn-whatsapp"
            type="button"
            onClick={() =>
              openWhatsApp("Hello MaxiGo Support, I need help.")
            }
          >
            Chat on WhatsApp
          </button>
        </article>

        <article className="help-contact-card">
          <div className="help-contact-icon">✉️</div>
          <h2>Email Support</h2>
          <p className="help-email">
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </p>

          <a
            className="help-btn help-btn-secondary"
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              "MaxiGo Customer Support"
            )}`}
          >
            Send Email
          </a>
        </article>

        <article className="help-contact-card">
          <div className="help-contact-icon">📍</div>
          <h2>Office Address</h2>
          <p>{SUPPORT_ADDRESS}</p>

          <a
            className="help-btn help-btn-secondary"
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        </article>
      </section>

      <section className="help-section">
        <div className="help-section-heading">
          <h2>How can we help you?</h2>
          <p>Choose a topic to find the right support.</p>
        </div>

        <div className="help-topic-grid">
          {helpTopics.map((topic) => (
            <button
              type="button"
              className="help-topic-card"
              key={topic.title}
              onClick={() =>
                setSelectedTopic((current) =>
                  current === topic.title ? "" : topic.title
                )
              }
              aria-expanded={selectedTopic === topic.title}
            >
              <span className="help-topic-icon">
                {topic.icon}
              </span>

              <span className="help-topic-content">
                <strong>{topic.title}</strong>
                <small>{topic.description}</small>
              </span>

              <span className="help-topic-arrow">
                {selectedTopic === topic.title ? "−" : "›"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="help-section help-complaint-section">
        <div className="help-section-heading">
          <h2>Submit a Complaint</h2>
          <p>
            Describe your issue and continue to WhatsApp Support.
          </p>
        </div>

        <form
          className="help-complaint-form"
          onSubmit={submitComplaint}
        >
          <label htmlFor="help-topic">Issue type *</label>

          <select
            id="help-topic"
            value={selectedTopic}
            onChange={(event) =>
              setSelectedTopic(event.target.value)
            }
            required
          >
            <option value="">Select your issue</option>

            {helpTopics.map((topic) => (
              <option key={topic.title} value={topic.title}>
                {topic.title}
              </option>
            ))}
          </select>

          <label htmlFor="help-order-id">
            Order ID (optional)
          </label>

          <input
            id="help-order-id"
            type="text"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Enter your order ID"
          />

          <label htmlFor="help-message">
            Describe your issue *
          </label>

          <textarea
            id="help-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell us how we can help..."
            rows={4}
            maxLength={1500}
            required
          />

          <div className="help-message-count">
            {message.length}/1500
          </div>

          <button
            className="help-btn help-btn-primary"
            type="submit"
          >
            Continue to WhatsApp
          </button>
        </form>
      </section>

      <section className="help-section">
        <div className="help-section-heading">
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions.</p>
        </div>

        <div className="help-faq-list">
          {faqs.map((faq, index) => (
            <article
              className="help-faq-item"
              key={faq.question}
            >
              <button
                type="button"
                className="help-faq-question"
                onClick={() =>
                  setOpenFaq((current) =>
                    current === index ? null : index
                  )
                }
                aria-expanded={openFaq === index}
              >
                <span>{faq.question}</span>
                <span>
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>

              {openFaq === index && (
                <p className="help-faq-answer">
                  {faq.answer}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="help-footer">
        <strong>MaxiGo Support</strong>
        <p>
          Need more help? Contact us using the options above.
        </p>

        <a href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>

        <p>{SUPPORT_ADDRESS}</p>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Directions
        </a>
      </footer>
    </main>
  );
}
