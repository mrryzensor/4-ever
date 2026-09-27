/**
 * companion_names historically sometimes contained the invitee as the first
 * array item in admin-edited RSVPs. New RSVPs store only accompanying people.
 * Drop a legacy invitee entry only when it positively matches fullName; array
 * length alone is not enough because older records may already contain a real
 * companion name in that position.
 */
export function parseGuestCompanionNames(
  value: string | null | undefined,
  guestFullName: string,
  confirmedPasses: number,
): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value || '[]');
  } catch {
    parsed = typeof value === 'string' ? value.split(',') : [];
  }

  if (!Array.isArray(parsed)) return [];

  const names = parsed.map((name) => typeof name === 'string' ? name.trim() : '');
  const totalPasses = Math.max(1, Math.trunc(Number(confirmedPasses) || 1));
  const companionCapacity = Math.max(0, totalPasses - 1);
  const normalizedGuestName = guestFullName.trim().toLocaleLowerCase();
  const firstNameIsInvitee = Boolean(normalizedGuestName && names[0]?.toLocaleLowerCase() === normalizedGuestName);
  const companions = firstNameIsInvitee ? names.slice(1) : names;

  return companions.filter(Boolean).slice(0, companionCapacity);
}

export function normalizeCompanionNames(names: unknown, companionCapacity: number): string[] {
  if (!Array.isArray(names)) return [];
  const capacity = Math.max(0, Math.trunc(Number(companionCapacity) || 0));
  return names
    .map((name) => typeof name === 'string' ? name.trim() : '')
    .filter(Boolean)
    .slice(0, capacity);
}
