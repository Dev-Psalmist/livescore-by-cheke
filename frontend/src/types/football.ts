export interface Team {
  name: string;
  shortName: string;
  logo?: string;
}

export interface Match {
  id: number;
  league: string;
  status: "LIVE" | "UPCOMING" | "FINISHED";
  minute?: string;
  kickoff?: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
}