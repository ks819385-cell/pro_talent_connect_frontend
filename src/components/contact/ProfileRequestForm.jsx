import { useState } from "react";
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { api } from "../../services/api";
import DOBCalendarPicker from "../common/DOBCalendarPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

/* ── shared styles ─────────────────────────────────────────── */
const inputBase =
  "w-full px-4 py-3 rounded-xl bg-white/4 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all duration-200";

const selectBase =
  "w-full rounded-xl bg-white/4 border border-white/10 text-white focus:outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all duration-200";

const errorBase = "mt-1.5 text-xs text-red-400";

function Field({ id, label, required, error, half, children }) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${half ? "md:col-span-1" : "md:col-span-2"}`}
    >
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

/* ── validation ─────────────────────────────────────────────── */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(d) {
  const errs = {};
  if (!d.fullName.trim()) errs.fullName = "Full name is required.";
  if (!d.email.trim()) errs.email = "Email is required.";
  else if (!emailRe.test(d.email)) errs.email = "Enter a valid email.";
  if (!d.dateOfBirth) errs.dateOfBirth = "Date of birth is required.";
  if (!d.nationality.trim()) errs.nationality = "Nationality is required.";
  if (!d.city.trim()) errs.city = "City is required.";
  if (!d.playingPosition) errs.playingPosition = "Please select your position.";
  if (!d.preferredFoot)
    errs.preferredFoot = "Please select your preferred foot.";
  if (!d.height) errs.height = "Height is required.";
  if (!d.weight) errs.weight = "Weight is required.";
  if (!d.yearsOfExperience && d.yearsOfExperience !== 0) errs.yearsOfExperience = "Years of experience is required.";
  return errs;
}

/* ── component ──────────────────────────────────────────────── */
const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  nationality: "",
  city: "",
  playingPosition: "",
  preferredFoot: "",
  height: "",
  weight: "",
  currentClub: "",
  yearsOfExperience: "",
  achievements: "",
  videoLink: "",
};

const ProfileRequestForm = () => {
  const [formData, setFormData] = useState(EMPTY);
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

  const setValue = (field) => (val) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      if (touched[field]) {
        setErrors(validate(next));
      }
      return next;
    });
  };

  const blur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {
      fullName: true,
      email: true,
      dateOfBirth: true,
      nationality: true,
      city: true,
      playingPosition: true,
      preferredFoot: true,
      height: true,
      weight: true,
      yearsOfExperience: true,
    };
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsSubmitting(true);
    try {
      await api.submitProfileRequest(formData);
      setSubmitted(true);
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.message ||
          "Failed to submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── success ──────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="bg-white/4 border border-white/10 rounded-2xl p-5 sm:p-8 md:p-10 text-center animate-fade-in shadow-xl shadow-black/30">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Request Submitted
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          Our team will review your information and contact you within 2–3
          business days.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData(EMPTY);
            setTouched({});
            setErrors({});
          }}
          className="px-6 py-3 rounded-full border border-white/10 text-sm font-medium text-gray-300 hover:border-white/30 hover:text-white transition-all duration-200"
        >
          Submit another request
        </button>
      </div>
    );
  }

  /* ── form ─────────────────────────────────────────────────── */
  const errBorder = (f) =>
    touched[f] && errors[f]
      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
      : "";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white/4 border border-white/10 rounded-2xl p-5 sm:p-8 md:p-10 shadow-xl shadow-black/30 space-y-6"
      aria-label="Profile creation request form"
    >
      <div>
        <h2 className="text-2xl font-bold text-white">
          Request Profile Creation
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked <span className="text-red-400">*</span> are required.
        </p>
      </div>

      {/* ── Required section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          id="fullName"
          label="Full Name"
          required
          half
          error={touched.fullName && errors.fullName}
        >
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={set("fullName")}
            onBlur={blur("fullName")}
            aria-invalid={!!(touched.fullName && errors.fullName)}
            className={`${inputBase} ${errBorder("fullName")}`}
            placeholder="John Doe"
          />
        </Field>

        <Field
          id="email"
          label="Email Address"
          required
          half
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
            className={`${inputBase} ${errBorder("email")}`}
            placeholder="john@example.com"
          />
        </Field>

        <Field
          id="playingPosition"
          label="Playing Position"
          required
          half
          error={touched.playingPosition && errors.playingPosition}
        >
          <Select
            value={formData.playingPosition}
            onValueChange={setValue("playingPosition")}
          >
            <SelectTrigger
              size="lg"
              id="playingPosition"
              aria-invalid={!!(touched.playingPosition && errors.playingPosition)}
              className={`${selectBase} ${errBorder("playingPosition")}`}
              onBlur={blur("playingPosition")}
            >
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
              <SelectItem value="Defender">Defender</SelectItem>
              <SelectItem value="Midfielder">Midfielder</SelectItem>
              <SelectItem value="Forward">Forward</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field
          id="preferredFoot"
          label="Preferred Foot"
          required
          half
          error={touched.preferredFoot && errors.preferredFoot}
        >
          <Select
            value={formData.preferredFoot}
            onValueChange={setValue("preferredFoot")}
          >
            <SelectTrigger
              size="lg"
              id="preferredFoot"
              aria-invalid={!!(touched.preferredFoot && errors.preferredFoot)}
              className={`${selectBase} ${errBorder("preferredFoot")}`}
              onBlur={blur("preferredFoot")}
            >
              <SelectValue placeholder="Select foot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Right">Right</SelectItem>
              <SelectItem value="Left">Left</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* ── Required personal details ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field id="phone" label="Phone Number" half error={touched.phone && errors.phone}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={set("phone")}
            onBlur={blur("phone")}
            aria-invalid={!!(touched.phone && errors.phone)}
            className={`${inputBase} ${errBorder("phone")}`}
            placeholder="+1 (555) 000-0000"
          />
        </Field>

        <Field id="dateOfBirth" label="Date of Birth" required half error={touched.dateOfBirth && errors.dateOfBirth}>
          <DOBCalendarPicker
            required
            value={formData.dateOfBirth}
            onChange={(v) => { set("dateOfBirth")({ target: { value: v } }); blur("dateOfBirth")(); }}
            minYear={1935}
            error={!!(touched.dateOfBirth && errors.dateOfBirth)}
          />
        </Field>

        <Field id="nationality" label="Nationality" required half error={touched.nationality && errors.nationality}>
          <input
            id="nationality"
            type="text"
            value={formData.nationality}
            onChange={set("nationality")}
            onBlur={blur("nationality")}
            aria-invalid={!!(touched.nationality && errors.nationality)}
            className={`${inputBase} ${errBorder("nationality")}`}
            placeholder="e.g., Brazilian"
          />
        </Field>

        <Field id="city" label="City" required half error={touched.city && errors.city}>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={set("city")}
            onBlur={blur("city")}
            aria-invalid={!!(touched.city && errors.city)}
            className={`${inputBase} ${errBorder("city")}`}
            placeholder="Your City"
          />
        </Field>

        <Field id="height" label="Height (cm)" required half error={touched.height && errors.height}>
          <input
            id="height"
            type="number"
            min="100"
            max="250"
            value={formData.height}
            onChange={set("height")}
            onBlur={blur("height")}
            aria-invalid={!!(touched.height && errors.height)}
            className={`${inputBase} ${errBorder("height")}`}
            placeholder="180"
          />
        </Field>

        <Field id="weight" label="Weight (kg)" required half error={touched.weight && errors.weight}>
          <input
            id="weight"
            type="number"
            min="40"
            max="150"
            value={formData.weight}
            onChange={set("weight")}
            onBlur={blur("weight")}
            aria-invalid={!!(touched.weight && errors.weight)}
            className={`${inputBase} ${errBorder("weight")}`}
            placeholder="75"
          />
        </Field>

        <Field id="yearsOfExperience" label="Years of Experience" required half error={touched.yearsOfExperience && errors.yearsOfExperience}>
          <input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="30"
            value={formData.yearsOfExperience}
            onChange={set("yearsOfExperience")}
            onBlur={blur("yearsOfExperience")}
            aria-invalid={!!(touched.yearsOfExperience && errors.yearsOfExperience)}
            className={`${inputBase} ${errBorder("yearsOfExperience")}`}
            placeholder="5"
          />
        </Field>

        <Field id="currentClub" label="Current Club" half>
          <input
            id="currentClub"
            type="text"
            value={formData.currentClub}
            onChange={set("currentClub")}
            className={inputBase}
            placeholder="e.g., FC Barcelona"
          />
        </Field>
      </div>

      {/* ── Optional section ── */}
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
          {showOptional ? "Hide" : "Add"} additional details (optional)
        </button>

        {showOptional && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <Field id="achievements" label="Achievements" half={false}>
              <textarea
                id="achievements"
                rows={4}
                value={formData.achievements}
                onChange={set("achievements")}
                className={`${inputBase} resize-none`}
                placeholder="List your awards, titles, or notable accomplishments..."
              />
            </Field>

            <Field id="videoLink" label="Highlight Video Link" half={false}>
              <input
                id="videoLink"
                type="url"
                value={formData.videoLink}
                onChange={set("videoLink")}
                className={inputBase}
                placeholder="https://youtube.com/watch?v=..."
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
              <Spinner /> Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileRequestForm;
