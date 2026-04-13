const DetailSkeleton = () => (
  <div className="animate-pulse space-y-5 p-6">
    {/* Header hero skeleton */}
    <div className="flex gap-5 items-start">
      <div className="w-24 h-24 rounded-xl bg-white/[0.05] shrink-0" />
      <div className="hidden sm:flex w-20 h-20 rounded-xl bg-white/[0.03] shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-7 bg-white/[0.05] rounded-lg w-48" />
        <div className="h-4 bg-white/[0.04] rounded-lg w-64" />
        <div className="h-3 bg-white/[0.03] rounded-full w-40 mt-2" />
      </div>
    </div>
    {/* Tabs skeleton */}
    <div className="flex gap-5 border-b border-white/[0.06] pb-1">
      {[80, 60, 64, 90, 68].map((w, i) => (
        <div
          key={i}
          className="h-4 bg-white/[0.04] rounded"
          style={{ width: w }}
        />
      ))}
    </div>
    {/* 70/30 grid skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5">
      <div className="space-y-4">
        <div className="h-36 bg-white/[0.04] rounded-xl" />
        <div className="h-48 bg-white/[0.04] rounded-xl" />
        <div className="h-28 bg-white/[0.04] rounded-xl" />
      </div>
      <div className="space-y-4">
        <div className="h-44 bg-white/[0.04] rounded-xl" />
        <div className="h-32 bg-white/[0.04] rounded-xl" />
      </div>
    </div>
  </div>
);

export default DetailSkeleton;
