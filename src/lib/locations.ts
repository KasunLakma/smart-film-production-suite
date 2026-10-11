/* Shared types for the Locations and Call Sheet pages */

export type LocStatus = "Idea" | "Shortlisted" | "Visited" | "Approved" | "Booked";

export const LOC_STATUSES: LocStatus[] = ["Idea", "Shortlisted", "Visited", "Approved", "Booked"];

export const LOC_STATUS_HELP: Record<LocStatus, string> = {
  Idea: "Just an idea, nothing checked yet",
  Shortlisted: "A good option, we may use it",
  Visited: "Someone went there and checked it",
  Approved: "The director said yes",
  Booked: "Owner agreed, date and payment fixed",
};

export interface LocationItem {
  id: string;
  name: string;
  area: string; // city / district
  country: string;
  type: string; // e.g. Beach, Old house, Temple, Street
  status: LocStatus;
  sceneIds: string[]; // scenes that will be shot here
  dailyFee: number;
  contactName: string;
  contactPhone: string;
  address: string;
  permits: string; // who to ask for permission
  facilities: { power: boolean; parking: boolean; toilets: boolean; food: boolean; stay: boolean };
  whyItFits: string;
  bestTime: string;
  notes: string;
  source: "ai" | "manual";
}

export interface LocationsState {
  items: LocationItem[];
}

export const DEFAULT_LOCATIONS: LocationsState = { items: [] };

export const mapsLink = (l: Pick<LocationItem, "name" | "area" | "country" | "address">) =>
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent([l.name, l.address || l.area, l.country].filter(Boolean).join(", "));

export const photosLink = (l: Pick<LocationItem, "name" | "area" | "country">) =>
  "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent([l.name, l.area, l.country].filter(Boolean).join(" "));
