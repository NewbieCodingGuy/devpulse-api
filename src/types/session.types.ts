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
