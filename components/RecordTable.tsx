import React from 'react';
import { AggregatedData, DailyRecord } from '../types';
import { formatDate } from '../utils/dateUtils';

interface RecordTableProps {
  data: AggregatedData[] | DailyRecord[];
  isAggregated: boolean;
  onEdit?: (recordId: string) => void; // Callback za pokretanje uređivanja
}

const commonCellClass = "px-4 py-3 text-sm";
const headerCellClass = `${commonCellClass} font-semibold text-left text-sky-300 uppercase tracking-wider whitespace-nowrap`;
const bodyCellClass = `${commonCellClass} text-slate-200 whitespace-nowrap`;
const actionButtonClass = "px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150";

export const RecordTable: React.FC<RecordTableProps> = ({ data, isAggregated, onEdit }) => {
  if (!data || data.length === 0) {
    return <p className="text-slate-400 text-center py-4">Nema dostupnih podataka za ovaj period.</p>;
  }

  const headers = isAggregated 
    ? ["Period", "Zapisa", "Bruto Prih. (€)", "Neto Zar. (€)", "Uk. Sati", "Neto €/sat", "KM", "L/100km", "Vožnji"]
    : ["Datum", "Bruto Prih. (€)", "Neto Zar. (€)", "Neto €/sat", "KM", "Gorivo (L)", "Gorivo (€)", "Ost. Troš. (€)", "Sati", "Vožnji", "Akcije"];

  return (
    <div className="overflow-x-auto bg-slate-800 shadow-md rounded-lg mt-6">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-700/50">
          <tr>
            {headers.map(header => <th key={header} scope="col" className={headerCellClass}>{header}</th>)}
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {data.map((item, index) => {
            if (isAggregated) {
              const aggItem = item as AggregatedData;
              return (
                <tr key={aggItem.period + index} className="hover:bg-slate-700/30 transition-colors">
                  <td className={bodyCellClass}>{aggItem.period}</td>
                  <td className={bodyCellClass}>{aggItem.recordCount}</td>
                  <td className={bodyCellClass}>{aggItem.grossRevenue.toFixed(2)}</td>
                  <td className={bodyCellClass}>{aggItem.netEarnings.toFixed(2)}</td>
                  <td className={bodyCellClass}>{aggItem.workHours.toFixed(1)}</td>
                  <td className={bodyCellClass}>{aggItem.avgNetEarningsPerHour?.toFixed(2) ?? 'N/A'}</td>
                  <td className={bodyCellClass}>{aggItem.kilometers.toFixed(1)}</td>
                  <td className={bodyCellClass}>{aggItem.avgFuelConsumptionLitersPer100Km?.toFixed(2) ?? 'N/A'}</td>
                  <td className={bodyCellClass}>{aggItem.numberOfRides}</td>
                </tr>
              );
            } else {
              const dailyItem = item as DailyRecord;
              const netEarningsPerHour = dailyItem.workHours > 0 ? (dailyItem.netEarnings / dailyItem.workHours) : NaN;
              return (
                <tr key={dailyItem.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className={bodyCellClass}>{formatDate(dailyItem.date)}</td>
                  <td className={bodyCellClass}>{dailyItem.grossRevenue.toFixed(2)}</td>
                  <td className={bodyCellClass}>{dailyItem.netEarnings.toFixed(2)}</td>
                  <td className={bodyCellClass}>{!isNaN(netEarningsPerHour) ? netEarningsPerHour.toFixed(2) : 'N/A'}</td>
                  <td className={bodyCellClass}>{dailyItem.kilometers.toFixed(1)}</td>
                  <td className={bodyCellClass}>{dailyItem.fuelLiters.toFixed(2)}</td>
                  <td className={bodyCellClass}>{dailyItem.fuelCost.toFixed(2)}</td>
                  <td className={bodyCellClass}>{dailyItem.otherExpenses.toFixed(2)}</td>
                  <td className={bodyCellClass}>{dailyItem.workHours.toFixed(1)}</td>
                  <td className={bodyCellClass}>{dailyItem.numberOfRides}</td>
                  <td className={bodyCellClass}>
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(dailyItem.id)}
                        className={`${actionButtonClass} bg-sky-600 hover:bg-sky-700 text-white`}
                        aria-label={`Uredi zapis za ${formatDate(dailyItem.date)}`}
                      >
                        Uredi
                      </button>
                    )}
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};