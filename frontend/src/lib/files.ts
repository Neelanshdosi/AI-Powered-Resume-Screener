const ALLOWED_RESUME_EXT = [".pdf", ".doc", ".docx"];

export function isAllowedResume(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_RESUME_EXT.some((ext) => name.endsWith(ext));
}

export function fileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function mergeResumeFiles(
  existing: File[],
  incoming: FileList | File[]
): { merged: File[]; rejected: string[] } {
  const rejected: string[] = [];
  const merged = [...existing];
  const keys = new Set(existing.map(fileKey));

  Array.from(incoming).forEach((file) => {
    if (!isAllowedResume(file)) {
      rejected.push(file.name);
      return;
    }
    const key = fileKey(file);
    if (!keys.has(key)) {
      keys.add(key);
      merged.push(file);
    }
  });

  return { merged, rejected };
}
