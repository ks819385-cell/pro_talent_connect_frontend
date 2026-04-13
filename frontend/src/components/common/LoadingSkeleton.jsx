const LoadingSkeleton = ({ count = 6, type = 'card' }) => {
  if (type === 'article') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="aspect-[16/9] bg-gray-700 rounded-3xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-3xl overflow-hidden animate-pulse">
          <div className="aspect-[16/10] bg-gray-700"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
