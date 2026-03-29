import { useState } from "react";
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { api } from "../../services/api";

/* ── tiny helpers ─────────────────────────────────────────── */
const inputBase =
  "w-full px-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all duration-200";

const errorBase = "mt-1.5 text-xs text-red-400";

function Field({ id, label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label}
        {required && (
          <span className="ml-1 text-red-400 text-xs" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className={errorBase} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ── validation ───────────────────────────────────────────── */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data) {
  const errs = {};
  if (!data.name.trim()) errs.name = "Name is required.";
  if (!data.email.trim()) errs.email = "Email is required.";
  else if (!emailRe.test(data.email)) errs.email = "Enter a valid email.";
  if (!data.message.trim()) errs.message = "Message is required.";
  else if (data.message.trim().length < 10)
    errs.message = "Message must be at least 10 characters.";
  return errs;
}

/* ── component ────────────────────────────────────────────── */
const EnquiryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    subject: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const set = (field) => (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (touched[field]) {
      setErrors(validate({ ...formData, [field]: val }));
    }
  };

  const blur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, message: true };
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsSubmitting(true);
    try {
      await api.submitEnquiry(formData);
      setSubmitted(true);
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          "Failed to send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── success state ──────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="bg-white/4 border border-white/10 rounded-2xl p-5 sm:p-8 md:p-10 text-center animate-fade-in shadow-xl shadow-black/30">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Message Sent</h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Thank you! We'll get back to you within one business day.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: "",
              email: "",
              message: "",
              phone: "",
              subject: "",
            });
            setTouched({});
            setErrors({});
          }}
          className="px-6 py-3 rounded-full border border-white/10 text-sm font-medium text-gray-300 hover:border-white/30 hover:text-white transition-all duration-200"
        >
          Send another message
        </button>
      </div>
    );
  }

  /* ── form ───────────────────────────────────────────────── */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white/4 border border-white/10 rounded-2xl p-5 sm:p-8 md:p-10 shadow-xl shadow-black/30 space-y-6"
      aria-label="Enquiry form"
    >
      <div>
        <h2 className="text-2xl font-bold text-white">Send a Message</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked <span className="text-red-400">*</span> are required.
        </p>
      </div>

      {/* Required fields */}
      <Field
        id="name"
        label="Full Name"
        required
        error={touched.name && errors.name}
      >
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={set("name")}
          onBlur={blur("name")}
          aria-invalid={!!(touched.name && errors.name)}
          aria-describedby={
            touched.name && errors.name ? "name-err" : undefined
          }
          className={`${inputBase} ${touched.name && errors.name ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20" : ""}`}
          placeholder="Jane Smith"
        />
      </Field>

      <Field
        id="email"
        label="Email Address"
        required
        error={touched.email && errors.email}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={set("email")}
          onBlur={blur("email")}
          aria-invalid={!!(touched.email && errors.email)}
          className={`${inputBase} ${touched.email && errors.email ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20" : ""}`}
          placeholder="jane@example.com"
        />
      </Field>

      <Field
        id="message"
        label="Message"
        required
        error={touched.message && errors.message}
      >
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={set("message")}
          onBlur={blur("message")}
          aria-invalid={!!(touched.message && errors.message)}
          className={`${inputBase} resize-none ${touched.message && errors.message ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20" : ""}`}
          placeholder="Tell us how we can help…"
        />
      </Field>

      {/* Optional collapsible */}
      <div>
        <button
          type="button"
          aria-expanded={showOptional}
          onClick={() => setShowOptional((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200 focus:outline-none focus-visible:underline"
        >
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-300 ${showOptional ? "rotate-180" : ""}`}
          />
          {showOptional ? "Hide" : "Add"} optional details
        </button>

        {showOptional && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <Field id="phone" label="Phone Number">
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={set("phone")}
                className={inputBase}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <Field id="subject" label="Subject">
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={set("subject")}
                className={inputBase}
                placeholder="How can we help?"
              />
            </Field>
          </div>
        )}
      </div>

      {/* Server-level error */}
      {errors.form && (
        <p
          className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          role="alert"
        >
          {errors.form}
        </p>
      )}

      {/* CTA */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-8 py-4 sm:py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
        >
          {isSubmitting ? (
            <>
              <Spinner /> Sending…
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </div>
    </form>
  );
};

export default EnquiryForm;
