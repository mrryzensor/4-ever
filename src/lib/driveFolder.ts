export interface DriveFolderReference {
  folderId: string;
  resourceKey?: string;
}

export function parseDriveFolderUrl(value?: string): DriveFolderReference | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['drive.google.com', 'www.drive.google.com'].includes(url.hostname)) {
      return null;
    }

    const folderMatch = url.pathname.match(/\/(?:drive\/)?folders\/([A-Za-z0-9_-]+)/i);
    if (!folderMatch) return null;

    const resourceKey = [...url.searchParams.entries()]
      .find(([key]) => key.toLowerCase() === 'resourcekey')?.[1];

    return {
      folderId: folderMatch[1],
      ...(resourceKey ? { resourceKey } : {}),
    };
  } catch {
    return null;
  }
}
