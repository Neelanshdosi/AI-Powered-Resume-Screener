export default function CandidateSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-4 bg-slate-700 rounded w-2/3" />
      <div className="h-3 bg-slate-700 rounded w-1/2" />
      <div className="h-3 bg-slate-700 rounded w-5/6" />
      <div className="h-3 bg-slate-700 rounded w-4/6" />
    </div>
  );
}
