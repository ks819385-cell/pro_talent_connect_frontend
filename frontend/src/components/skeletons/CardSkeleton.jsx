const CardSkeleton = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 animate-pulse">
      <div className="w-16 h-16 bg-gray-700 rounded-2xl mb-6"></div>
      <div className="h-6 bg-gray-700 rounded mb-4 w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
  );
};

export default CardSkeleton;
