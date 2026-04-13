const ServiceCard = ({ icon: Icon, title, description, bgColor }) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2">
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-16 h-16 ${bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 leading-relaxed">{description}</p>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default ServiceCard;
