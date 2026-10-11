/* Shared types and starter data for the Cast & Crew and Call Sheet pages */

export interface Person {
  id: string;
  name: string;
  kind: "Actor" | "Crew";
  role: string;
  ageRange: string;
  languages: string[];
  city: string;
  experience: string;
  dayRate: number;
  contact: string;
  notes: string;
  available: boolean;
  isSample?: boolean;
}

export type TeamStatus = "Shortlisted" | "Confirmed" | "Declined";

export interface TeamMember {
  id: string;
  personId: string;
  roleOnFilm: string;
  status: TeamStatus;
  dayRate: number;
  days: number;
}

export interface RosterState {
  directory: Person[];
  team: TeamMember[];
  casting: Record<string, string>; // CHARACTER NAME (upper-case) -> personId
  seeded: boolean;
}

export const DEFAULT_ROSTER: RosterState = { directory: [], team: [], casting: {}, seeded: false };

export const charKey = (name: string) => String(name || "").trim().toUpperCase();

export const ACTOR_ROLES = [
  "Lead actor",
  "Lead actress",
  "Supporting actor",
  "Supporting actress",
  "Elder actor",
  "Child actor",
  "Extra / small role",
];

export const CREW_ROLES = [
  "Director",
  "Producer",
  "Assistant Director",
  "Director of Photography",
  "Camera Operator",
  "Gaffer (lighting)",
  "Sound Recordist",
  "Art Director",
  "Costume Designer",
  "Make-up Artist",
  "Editor",
  "Production Manager",
  "Location Manager",
  "Stunt Coordinator",
  "Driver",
  "Other",
];

const P = (
  id: string,
  name: string,
  kind: "Actor" | "Crew",
  role: string,
  ageRange: string,
  languages: string[],
  city: string,
  experience: string,
  dayRate: number
): Person => ({
  id,
  name,
  kind,
  role,
  ageRange,
  languages,
  city,
  experience,
  dayRate,
  contact: "",
  notes: "",
  available: true,
  isSample: true,
});

/** Made-up example profiles so the page is not empty. They are NOT real people. */
export const SAMPLE_PEOPLE: Person[] = [
  P("smp-01", "Sample · Ruwan Jayasena", "Actor", "Lead actor", "30–40", ["Sinhala", "English"], "Colombo", "8 years · TV drama and stage", 60000),
  P("smp-02", "Sample · Thilini Wickrama", "Actor", "Lead actress", "25–35", ["Sinhala", "English"], "Kandy", "6 years · films and teledrama", 55000),
  P("smp-03", "Sample · Mahesh Fernando", "Actor", "Supporting actor", "40–55", ["Sinhala"], "Negombo", "15 years · character roles", 25000),
  P("smp-04", "Sample · Anjali Dissanayake", "Actor", "Supporting actress", "20–30", ["Sinhala", "Tamil", "English"], "Colombo", "4 years · short films", 22000),
  P("smp-05", "Sample · Sivakumar Rajan", "Actor", "Supporting actor", "30–45", ["Tamil", "Sinhala", "English"], "Colombo", "10 years · stage and film", 25000),
  P("smp-06", "Sample · Podi Sirimal", "Actor", "Elder actor", "60+", ["Sinhala"], "Galle", "30 years · village elder roles", 18000),
  P("smp-07", "Sample · Dineth (child actor)", "Actor", "Child actor", "8–12", ["Sinhala"], "Colombo", "2 years · adverts", 8000),
  P("smp-08", "Sample · Chamara Gunawardena", "Crew", "Director of Photography", "35–50", ["Sinhala", "English"], "Colombo", "12 years · features and adverts", 45000),
  P("smp-09", "Sample · Isuru Peiris", "Crew", "Camera Operator", "25–35", ["Sinhala", "English"], "Gampaha", "6 years", 22000),
  P("smp-10", "Sample · Nuwan Silva", "Crew", "Gaffer (lighting)", "30–45", ["Sinhala"], "Colombo", "10 years", 18000),
  P("smp-11", "Sample · Kavindi Ratnayake", "Crew", "Sound Recordist", "28–40", ["Sinhala", "English"], "Colombo", "7 years · location sound", 20000),
  P("smp-12", "Sample · Harsha Abeywickrama", "Crew", "Art Director", "35–50", ["Sinhala", "English"], "Kandy", "14 years · period and modern sets", 30000),
  P("smp-13", "Sample · Dilani Senanayake", "Crew", "Costume Designer", "30–45", ["Sinhala", "English"], "Colombo", "9 years", 20000),
  P("smp-14", "Sample · Sachini Mendis", "Crew", "Make-up Artist", "25–40", ["Sinhala", "English"], "Colombo", "8 years · film and bridal", 15000),
  P("smp-15", "Sample · Pradeep Liyanage", "Crew", "Editor", "30–45", ["Sinhala", "English"], "Colombo", "11 years", 25000),
  P("smp-16", "Sample · Tharindu Samarasinghe", "Crew", "Assistant Director", "28–40", ["Sinhala", "English"], "Colombo", "8 years", 22000),
  P("smp-17", "Sample · Nirosha Gamage", "Crew", "Production Manager", "32–48", ["Sinhala", "English"], "Colombo", "12 years", 28000),
  P("smp-18", "Sample · Lakshan Wijesinghe", "Crew", "Location Manager", "28–42", ["Sinhala", "English", "Tamil"], "Kandy", "7 years · all-island locations", 20000),
  P("smp-19", "Sample · Roshan Kumar", "Crew", "Stunt Coordinator", "30–45", ["Sinhala", "English"], "Colombo", "10 years", 30000),
];
