import TEAMS from "./teams.json";

interface TeamEntry {
  abbreviation: string;
  displayName: string;
  fullName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

const index = new Map<string, TeamEntry>();

for (const sport of Object.values(TEAMS)) {
  for (const team of sport as TeamEntry[]) {
    if (!team.logo) continue;
    index.set(team.abbreviation.toLowerCase(), team);
    index.set(team.displayName.toLowerCase(), team);
    index.set(team.fullName.toLowerCase(), team);
  }
}

export function findTeam(name: string): TeamEntry | undefined {
  if (!name) return undefined;
  return index.get(name.trim().toLowerCase());
}

export function teamLogo(name: string): string | undefined {
  return findTeam(name)?.logo;
}
