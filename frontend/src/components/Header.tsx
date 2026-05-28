export default function Header() {
  return (
    <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-400">
          SkillScan.AI
        </h1>
        <p className="text-slate-300">
          AI-Powered Resume Screening & Candidate Ranking
        </p>
      </div>
      <div className="text-sm text-slate-400">
        Production-ready ATS-like screening workflow
      </div>
    </section>
  );
}
