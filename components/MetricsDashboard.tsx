import React, { useState, useMemo } from 'react';
import { DailyRecord, AggregatedData, PeriodType } from '../types';
import { aggregateRecords } from '../utils/aggregationUtils';
import { RecordTable } from './RecordTable';
import { MetricChart } from './MetricChart';
import { SummaryCard } from './SummaryCard';
import { IncomeCostCard } from './IncomeCostCard'; 

interface MetricsDashboardProps {
  records: DailyRecord[];
  onEditRecordRequest: (recordId: string) => void; 
}

const periodTypeOptions = [
  { label: "Dnevno", value: PeriodType.Daily },
  { label: "Tjedno", value: PeriodType.Weekly },
  { label: "Mjesečno", value: PeriodType.Monthly },
];

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ records, onEditRecordRequest }) => {
  const [selectedPeriodType, setSelectedPeriodType] = useState<PeriodType>(PeriodType.Weekly);

  const aggregatedData = useMemo(() => {
    return aggregateRecords(records, selectedPeriodType);
  }, [records, selectedPeriodType]);
  
  const dailyRecordsForTable = useMemo(() => {
    if (selectedPeriodType === PeriodType.Daily) {
      return [...records].sort((a,b) => b.date.localeCompare(a.date));
    }
    return [];
  }, [records, selectedPeriodType]);


  const overallSummary = useMemo(() => {
    if (records.length === 0) return null;
    const totalGrossRevenue = records.reduce((sum, r) => sum + r.grossRevenue, 0);
    const totalNetEarnings = records.reduce((sum, r) => sum + r.netEarnings, 0);
    const totalKilometers = records.reduce((sum, r) => sum + r.kilometers, 0);
    const totalFuelLiters = records.reduce((sum, r) => sum + r.fuelLiters, 0);
    const totalWorkHours = records.reduce((sum, r) => sum + r.workHours, 0);
    const totalRides = records.reduce((sum, r) => sum + r.numberOfRides, 0);

    return {
      totalGrossRevenue,
      totalNetEarnings,
      avgNetEarningsPerKm: totalKilometers > 0 ? totalNetEarnings / totalKilometers : 0,
      avgFuelConsumption: totalKilometers > 0 ? (totalFuelLiters / totalKilometers) * 100 : 0,
      totalWorkHours, // Dodano za prikaz
      avgNetEarningsPerHour: totalWorkHours > 0 ? totalNetEarnings / totalWorkHours : 0,
      totalRides,
    };
  }, [records]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriodType(event.target.value as PeriodType);
  };
  
  const dataForTable = selectedPeriodType === PeriodType.Daily ? dailyRecordsForTable : aggregatedData;

  return (
    <div className="p-6 bg-slate-800 shadow-xl rounded-lg mt-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold text-sky-400 mb-6 text-center">Kontrolna Ploča</h2>

      {records.length === 0 ? (
         <p className="text-slate-400 text-center py-8 text-lg">Još nema unesenih zapisa. Dodajte podatke da biste vidjeli kontrolnu ploču.</p>
      ) : (
        <>
          {overallSummary && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-sky-300 mb-4">Ukupni Sažetak (Sve Vrijeme)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <SummaryCard title="Ukupni Bruto Prihod" value={overallSummary.totalGrossRevenue} unit="€" colorClass="text-green-400" />
                <SummaryCard title="Ukupna Neto Zarada" value={overallSummary.totalNetEarnings} unit="€" colorClass="text-emerald-400" />
                <SummaryCard title="Ukupno Radnih Sati" value={overallSummary.totalWorkHours} unit="sati" />
                <SummaryCard title="Prosj. Neto € / sat" value={overallSummary.avgNetEarningsPerHour} unit="€/h" />
                <SummaryCard title="Prosj. Neto € / km" value={overallSummary.avgNetEarningsPerKm} unit="€/km" />
                <SummaryCard title="Prosj. Potrošnja" value={overallSummary.avgFuelConsumption} unit="L/100km" />
              </div>
            </div>
          )}

          <div className="mb-6 flex justify-center">
            <div className="inline-block">
                <label htmlFor="periodType" className="block text-sm font-medium text-slate-300 mb-1">Prikaži Podatke Po:</label>
                <select
                id="periodType"
                value={selectedPeriodType}
                onChange={handlePeriodChange}
                className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
                >
                {periodTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
                </select>
            </div>
          </div>
        
          <RecordTable 
            data={dataForTable} 
            isAggregated={selectedPeriodType !== PeriodType.Daily} 
            onEdit={selectedPeriodType === PeriodType.Daily ? onEditRecordRequest : undefined}
          />

          {/* New Income vs. Costs Breakdown Section */}
          {aggregatedData.length > 0 && selectedPeriodType !== PeriodType.Daily && ( 
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-sky-300 mb-4 text-center">
                {selectedPeriodType} Pregled Prihoda i Troškova
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {aggregatedData.map((item) => (
                  <IncomeCostCard key={item.period} item={item} />
                ))}
              </div>
            </div>
          )}
          
          {aggregatedData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <MetricChart 
                data={aggregatedData} 
                dataKeyY="netEarnings" 
                dataKeyX="period" 
                chartType="bar" 
                title={`${selectedPeriodType} Neto Zarada`}
                yAxisLabel="Neto Zarada (€)"
                color="#38bdf8" // sky-500
              />
              <MetricChart 
                data={aggregatedData} 
                dataKeyY="grossRevenue" 
                dataKeyX="period" 
                chartType="bar" 
                title={`${selectedPeriodType} Bruto Prihod`}
                yAxisLabel="Bruto Prihod (€)"
                color="#34d399" // emerald-400
              />
               <MetricChart 
                data={aggregatedData} 
                dataKeyY="workHours" 
                dataKeyX="period" 
                chartType="bar" 
                title={`${selectedPeriodType} Radni Sati`}
                yAxisLabel="Sati"
                color="#a78bfa" // violet-400
              />
              <MetricChart 
                data={aggregatedData} 
                dataKeyY="avgNetEarningsPerHour" 
                dataKeyX="period" 
                chartType="line" 
                title={`${selectedPeriodType} Neto Zarada Po Satu`}
                yAxisLabel="€/sat"
                color="#f472b6" // pink-400
              />
              <MetricChart 
                data={aggregatedData} 
                dataKeyY="kilometers" 
                dataKeyX="period" 
                chartType="line" 
                title={`${selectedPeriodType} Prijeđeni Kilometri`}
                yAxisLabel="Kilometri"
                color="#fbbf24" // amber-400
              />
              <MetricChart 
                data={aggregatedData} 
                dataKeyY="avgFuelConsumptionLitersPer100Km" 
                dataKeyX="period" 
                chartType="line" 
                title={`${selectedPeriodType} Potrošnja Goriva (L/100km)`}
                yAxisLabel="L/100km"
                color="#f87171" // red-400
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};