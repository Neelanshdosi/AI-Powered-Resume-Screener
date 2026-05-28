function Chip({ text, className }: { text: string; className: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${className}`}>{text}</span>
  );
}

export default function SkillChips({
  skills,
  variant,
}: {
  skills: string[];
  variant: "match" | "missing";
}) {
  const shown = skills.slice(0, 8);
  if (!shown.length) {
    return <span className="text-sm text-slate-400">None</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((skill) => (
        <Chip
          key={skill}
          text={skill}
          className={variant === "match" ? "bg-emerald-700" : "bg-rose-700"}
        />
      ))}
    </div>
  );
}
