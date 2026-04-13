const HowItWorksCard = ({
  stepNumber,
  icon: Icon,
  title,
  description,
  bgColor,
}) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2">
      {/* Step number badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <div
          className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-gray-900`}
        >
          {stepNumber}
        </div>
      </div>

      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-20 h-20 ${bgColor}/20 border-2 border-current rounded-full mb-6 mt-4 group-hover:scale-110 transition-transform duration-300`}
        style={{ color: bgColor.replace("bg-", "") }}
      >
        <Icon
          className="w-10 h-10"
          style={{ color: bgColor.replace("bg-", "rgb(var(--color-") + "))" }}
        />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default HowItWorksCard;
