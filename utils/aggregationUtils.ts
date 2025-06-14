
import { DailyRecord, AggregatedData, PeriodType } from '../types';
import { getYearAndWeek, getYearAndMonth } from './dateUtils';

export const aggregateRecords = (records: DailyRecord[], periodType: PeriodType): AggregatedData[] => {
  if (!records || records.length === 0) return [];

  const groupedData: Record<string, DailyRecord[]> = {};

  records.forEach(record => {
    let key = '';
    if (periodType === PeriodType.Daily) {
      key = record.date;
    } else if (periodType === PeriodType.Weekly) {
      key = getYearAndWeek(record.date);
    } else if (periodType === PeriodType.Monthly) {
      key = getYearAndMonth(record.date);
    }
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(record);
  });

  return Object.entries(groupedData).map(([period, periodRecords]) => {
    const totalGrossRevenue = periodRecords.reduce((sum, r) => sum + r.grossRevenue, 0);
    const totalKilometers = periodRecords.reduce((sum, r) => sum + r.kilometers, 0);
    const totalFuelLiters = periodRecords.reduce((sum, r) => sum + r.fuelLiters, 0);
    const totalFuelCost = periodRecords.reduce((sum, r) => sum + r.fuelCost, 0);
    const totalOtherExpenses = periodRecords.reduce((sum, r) => sum + r.otherExpenses, 0);
    const totalNetEarnings = periodRecords.reduce((sum, r) => sum + r.netEarnings, 0);
    const totalWorkHours = periodRecords.reduce((sum, r) => sum + r.workHours, 0); // This remains correct
    const totalNumberOfRides = periodRecords.reduce((sum, r) => sum + r.numberOfRides, 0);

    const aggregated: AggregatedData = {
      period,
      recordCount: periodRecords.length,
      grossRevenue: totalGrossRevenue,
      kilometers: totalKilometers,
      fuelLiters: totalFuelLiters,
      fuelCost: totalFuelCost,
      otherExpenses: totalOtherExpenses,
      netEarnings: totalNetEarnings,
      workHours: totalWorkHours,
      numberOfRides: totalNumberOfRides,
    };

    if (totalKilometers > 0) {
      aggregated.avgNetEarningsPerKm = totalNetEarnings / totalKilometers;
      aggregated.avgFuelConsumptionLitersPer100Km = (totalFuelLiters / totalKilometers) * 100;
    }
    if (totalWorkHours > 0) {
      aggregated.avgNetEarningsPerHour = totalNetEarnings / totalWorkHours;
    }
    if (totalNumberOfRides > 0) {
      aggregated.avgGrossRevenuePerRide = totalGrossRevenue / totalNumberOfRides;
    }
    
    return aggregated;
  }).sort((a,b) => b.period.localeCompare(a.period)); // Sort by period descending
};
