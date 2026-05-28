import type { CandidateResult } from "@/lib/types";
import SkillChips from "./SkillChips";

export default function CandidateCard({ candidate }: { candidate: CandidateResult }) {
  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-lg text-emerald-300">
            {candidate.candidate_name || "Unknown Candidate"}
          </h3>
          <p className="text-sm text-slate-400">{candidate.filename || "N/A"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Rank</p>
          <p className="text-xl font-extrabold text-amber-300">#{candidate.rank}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Match Score</span>
          <span className="font-semibold">{candidate.match_score}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${candidate.match_score}%` }}
          />
        </div>
      </div>

      <div className="text-sm text-slate-300">
        <p>
          Experience Relevance:{" "}
          <span className="font-semibold">{candidate.experience_relevance}%</span>
        </p>
        <p>
          Education Relevance:{" "}
          <span className="font-semibold">{candidate.education_relevance}%</span>
        </p>
        <p>
          Semantic Similarity:{" "}
          <span className="font-semibold">{candidate.semantic_similarity}%</span>
        </p>
      </div>

      <div>
        <p className="text-xs uppercase text-slate-400 mb-1">Matching Skills</p>
        <SkillChips skills={candidate.matching_skills || []} variant="match" />
      </div>
      <div>
        <p className="text-xs uppercase text-slate-400 mb-1">Missing Skills</p>
        <SkillChips skills={candidate.missing_skills || []} variant="missing" />
      </div>
    </article>
  );
}
