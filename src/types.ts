export enum AppView {
  HOME = "HOME",
  CHAT = "CHAT",
  SELF_HELP = "SELF_HELP",
  COUNSELOR_PORTAL = "COUNSELOR_PORTAL",
  SETTINGS = "SETTINGS"
}

export type Role = "user" | "model" | "system";

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: string;
  isPending?: boolean;
  read_at?: string | null;
}

export interface StudentSession {
  id: string;
  name: string; // Sobat_xxxx
  waitingSince: string; // duration
  status: "waiting" | "active" | "completed";
  unreadCount: number;
}

export interface EmergencyContact {
  id: string;
  title: string;
  subtitle: string;
  number: string;
  isEmergency: boolean;
  type: string;
}

export interface WellnessJournal {
  id: string;
  date: string;
  trigger: string;
  feeling: string;
  wellnessTip: string;
}

export interface AppSettings {
  darkMode: boolean;
  textSize: "normal" | "besar" | "ekstra-besar";
}
