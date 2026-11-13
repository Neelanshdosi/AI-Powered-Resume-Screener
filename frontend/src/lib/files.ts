const ALLOWED_RESUME_EXT = [".pdf", ".doc", ".docx"];

export interface ManagedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  extension: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
}

export function isAllowedResume(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_RESUME_EXT.some((ext) => name.endsWith(ext));
}

export function fileFingerprint(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function createManagedFile(file: File): ManagedFile {
  const ext = getFileExtension(file.name);
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    extension: ext,
  };
}

export function mergeResumeFiles(
  existing: ManagedFile[],
  incoming: FileList | File[]
): { merged: ManagedFile[]; rejected: string[] } {
  const rejected: string[] = [];
  const merged = [...existing];
  const fingerprints = new Set(existing.map((item) => fileFingerprint(item.file)));

  Array.from(incoming).forEach((file) => {
    if (!isAllowedResume(file)) {
      rejected.push(file.name);
      return;
    }
    const fp = fileFingerprint(file);
    if (!fingerprints.has(fp)) {
      fingerprints.add(fp);
      merged.push(createManagedFile(file));
    }
  });

  return { merged, rejected };
}
