import { addDays, formatISO, isLeapYear, startOfYear } from "date-fns";

export type Colleague = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
};

export type ServerShift = {
  id: string;
  colleagueId: string;
  date: string; // ISO date
  shiftType: string;
  pattern: string;
};

export type SpecialDate = {
  label: string;
  type: "holiday" | "event";
  description?: string;
};

export const DEFAULT_COLLEAGUES: Colleague[] = [
  { id: "self", firstName: "Kari", lastName: "Nordmann", title: "Sykepleier" },
  { id: "thomas", firstName: "Thomas", lastName: "Berg", title: "Fysioterapeut" },
  { id: "fatima", firstName: "Fatima", lastName: "Rahman", title: "Helsesekretær" },
  { id: "lars", firstName: "Lars", lastName: "Hansen", title: "Miljøterapeut" },
];

export const SPECIAL_DATES: Record<string, SpecialDate> = {
  "2024-01-01": { label: "Nyttårsdag", type: "holiday" },
  "2024-05-17": { label: "Grunnlovsdag", type: "holiday" },
  "2024-12-24": { label: "Julaften", type: "holiday" },
  "2024-12-25": { label: "1. juledag", type: "holiday" },
  "2024-07-14": { label: "Bursdag Thomas", type: "event", description: "Feiring i lunsjen" },
};

const SHIFT_PATTERNS: Record<string, string> = {
  day: "Dagvakt 07:00–15:00",
  evening: "Kveldsvakt 15:00–23:00",
  night: "Nattevakt 23:00–07:00",
  support: "Støttevakt 10:00–18:00",
};

export function getPatternLabel(shiftType: string): string {
  return SHIFT_PATTERNS[shiftType] ?? shiftType;
}

export function generateServerShifts(year: number): ServerShift[] {
  const start = startOfYear(new Date(year, 0, 1));
  const daysInYear = isLeapYear(start) ? 366 : 365;
  const shifts: ServerShift[] = [];

  for (let dayIndex = 0; dayIndex < daysInYear; dayIndex++) {
    const date = addDays(start, dayIndex);
    const iso = formatISO(date, { representation: "date" });

    // Egen turnus (Kari) - jobber dagvakt hver tredje dag
    if (dayIndex % 3 === 0) {
      shifts.push({
        id: `self-${iso}`,
        colleagueId: "self",
        date: iso,
        shiftType: "day",
        pattern: getPatternLabel("day"),
      });
    }

    // Thomas jobber to dager på (dag + kveld) og to dager av
    const thomasCycle = dayIndex % 4;
    if (thomasCycle === 0 || thomasCycle === 1) {
      shifts.push({
        id: `thomas-${iso}`,
        colleagueId: "thomas",
        date: iso,
        shiftType: thomasCycle === 0 ? "day" : "evening",
        pattern: getPatternLabel(thomasCycle === 0 ? "day" : "evening"),
      });
    }

    // Fatima dekker nattevakter hver femte dag
    if (dayIndex % 5 === 2) {
      shifts.push({
        id: `fatima-${iso}`,
        colleagueId: "fatima",
        date: iso,
        shiftType: "night",
        pattern: getPatternLabel("night"),
      });
    }

    // Lars er støtte i helger (lørdag og søndag)
    const weekday = date.getDay();
    if (weekday === 6 || weekday === 0) {
      shifts.push({
        id: `lars-${iso}`,
        colleagueId: "lars",
        date: iso,
        shiftType: "support",
        pattern: getPatternLabel("support"),
      });
    }
  }

  return shifts;
}
