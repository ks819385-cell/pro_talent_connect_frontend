const PageHeader = ({ badge, title, subtitle, ctaButton }) => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {badge && (
          <div className="inline-block px-4 py-2 bg-black/30 border border-white/20 rounded-full text-white/80 text-sm font-semibold mb-6 backdrop-blur-sm">
            {badge}
          </div>
        )}

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {ctaButton}
      </div>
    </section>
  );
};

export default PageHeader;
