import { HeartIcon } from "@heroicons/react/24/outline";

const DEFAULT_HISTORY = `Started in 2023, Pro Talent Connect was born from a simple observation: many talented players lacked the visibility and connections needed to advance their careers. Traditional scouting methods were limited by geographic and network constraints, leaving countless players undiscovered.

We set out to revolutionize player discovery by creating a comprehensive, accessible database where players showcase their skills and connect with scouts, clubs, and opportunities. Today, we serve over 1,000 professional players across 50+ countries, connecting them to more than 200 partnering clubs.

Our platform combines detailed player profiles, verified credentials, career statistics, and highlights to allow scouts and clubs to discover talent based on skill, statistics, and potential—rather than just connections or geography.

Together, we're building the future of football talent discovery—one player at a time.`;

const OurStory = ({ history, images }) => {
  const storyText = history || DEFAULT_HISTORY;
  const storyParagraphs = storyText.split("\n").filter(p => p.trim());
  const heroImage = images?.length > 0
    ? images[0]
    : "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop";
  return (
    <section className="relative py-16 md:py-24 lg:py-28 px-4">
      {/* Background liquid effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/10 via-transparent to-white/8 opacity-30"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s" }}
        ></div>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content - Left */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-black/20 border border-white/30 rounded-lg">
                <HeartIcon className="w-6 h-6 text-white/80" />
              </div>
              <h2
                className="text-3xl font-semibold"
                style={{ fontSize: "clamp(28px, 4vw, 32px)" }}
              >
                Our Story
              </h2>
            </div>

            <div className="space-y-5" style={{ maxWidth: "720px" }}>
              {storyParagraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base leading-relaxed"
                  style={{ color: "#B3B3B3" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Abstract Football Image - Right */}
          <div className="relative">
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-8 hover:border-white/30 transition-all duration-300 overflow-hidden group">
              {/* Animated liquid glass effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/8 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/20 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-tr-full"></div>

              {/* Image placeholder - using subtle football pattern */}
              <div className="relative z-10 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                <img
                  src={heroImage}
                  alt="Football action"
                  className="w-full h-full object-cover opacity-40 hover:opacity-60 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
