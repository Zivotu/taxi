import React from 'react';
import { AggregatedData } from '../types';

interface IncomeCostCardProps {
  item: AggregatedData;
}

export const IncomeCostCard: React.FC<IncomeCostCardProps> = ({ item }) => {
  const totalCosts = item.fuelCost + item.otherExpenses;
  const netProfit = item.netEarnings; 

  const profitColorClass = netProfit >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow-md flex flex-col space-y-1">
      <h4 className="text-md font-semibold text-sky-300 text-center truncate" title={item.period}>
        {item.period}
      </h4>
      <div className="text-sm">
        <span className="text-slate-400">Prihod: </span>
        <span className="font-medium text-slate-200 float-right">€{item.grossRevenue.toFixed(2)}</span>
      </div>
      <div className="text-sm">
        <span className="text-slate-400">Troškovi: </span>
        <span className="font-medium text-slate-200 float-right">€{totalCosts.toFixed(2)}</span>
      </div>
       <hr className="border-slate-600 my-1" />
      <div className="text-sm">
        <span className="text-slate-300 font-semibold">Neto Dobit: </span>
        <span className={`font-bold float-right ${profitColorClass}`}>€{netProfit.toFixed(2)}</span>
      </div>
      <hr className="border-slate-600 my-1" />
      <div className="text-sm">
        <span className="text-slate-400">Radni Sati: </span>
        <span className="font-medium text-slate-200 float-right">{item.workHours.toFixed(1)} h</span>
      </div>
      <div className="text-sm">
        <span className="text-slate-400">Neto €/sat: </span>
        <span className="font-medium text-slate-200 float-right">{item.avgNetEarningsPerHour?.toFixed(2) ?? 'N/A'} €/h</span>
      </div>
    </div>
  );
};