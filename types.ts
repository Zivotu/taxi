export interface Shift {
  id?: string; // Opcionalno, može biti korisno za naprednije upravljanje smjenama
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  grossRevenue: number;
  kilometers: number;
  fuelLiters: number;
  fuelCost: number;
  otherExpenses: number;
  shifts: Shift[];
  workHours: number; // Ukupno izračunato iz smjena
  numberOfRides: number;
  netEarnings: number; // Izračunato: grossRevenue - fuelCost - otherExpenses
}

export interface AggregatedData extends Omit<DailyRecord, 'id' | 'date' | 'shifts' > {
  period: string; // npr., '2023-W50', '2023-12', ili specifični datum za dnevni prikaz
  recordCount: number;
  avgNetEarningsPerKm?: number;
  avgFuelConsumptionLitersPer100Km?: number;
  avgNetEarningsPerHour?: number;
  avgGrossRevenuePerRide?: number;
}

export enum PeriodType {
  Daily = "Dnevno",
  Weekly = "Tjedno",
  Monthly = "Mjesečno",
}