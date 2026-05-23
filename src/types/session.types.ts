export interface UserSession {
  id: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date | null;
  durationMin: number | null;
  language: string;
  notes: string | null;
}

export interface SessionListResult {
  allSessions: UserSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
