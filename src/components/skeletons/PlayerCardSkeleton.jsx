const PlayerCardSkeleton = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 animate-pulse">
      {/* Image */}
      <div className="w-full h-48 bg-gray-700 rounded-2xl mb-4"></div>
      
      {/* Name */}
      <div className="h-6 bg-gray-700 rounded mb-3 w-3/4"></div>
      
      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
      
      {/* Button */}
      <div className="h-10 bg-gray-700 rounded-lg"></div>
    </div>
  );
};

export default PlayerCardSkeleton;
