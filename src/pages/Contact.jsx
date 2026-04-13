import { useState } from "react";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import FloatingShapes from "../components/common/FloatingShapes";
import EnquiryForm from "../components/contact/EnquiryForm";
import ProfileRequestForm from "../components/contact/ProfileRequestForm";

const TABS = [
  { id: "enquiry", label: "Send an Enquiry", Icon: EnvelopeIcon },
  { id: "profile", label: "Request Profile Creation", Icon: UserIcon },
];

const Contact = () => {
  const [activeTab, setActiveTab] = useState("enquiry");

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-black to-gray-950 text-white overflow-x-hidden">
      <FloatingShapes />

      <main className="relative z-10">
        {/* ── Hero ────────────────────────────────── */}
        <section className="pt-24 md:pt-36 pb-12 md:pb-24 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 md:mb-6 leading-tight">
            Contact Us
          </h1>
          <p
            className="text-base md:text-xl text-gray-400 leading-relaxed mx-auto mb-8 md:mb-10"
            style={{ maxWidth: 600 }}
          >
            Have a question or want to join our network? Drop us a message —
            we'll get back to you within one business day.
          </p>
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 px-6 py-3.5 md:px-8 md:py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            <EnvelopeIcon className="w-5 h-5" />
            Get in Touch
          </a>
        </section>

        {/* ── Tab + Form ──────────────────────────── */}
        <section id="contact-form" className="pb-20 md:pb-28 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Tab Strip — stacks on mobile */}
            <div
              role="tablist"
              aria-label="Contact options"
              className="relative flex flex-col sm:flex-row border-b border-white/10 mb-6 md:mb-10"
            >
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(id)}
                    className={`relative flex items-center gap-2 px-4 py-3.5 sm:px-6 sm:py-4 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      active
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                    {/* Active underline */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-red-500 transition-all duration-300 ${
                        active
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Forms — fade transition */}
            <div className="relative">
              {activeTab === "enquiry" ? (
                <div key="enquiry" className="animate-fade-in">
                  <EnquiryForm />
                </div>
              ) : (
                <div key="profile" className="animate-fade-in">
                  <ProfileRequestForm />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
