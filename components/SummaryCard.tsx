import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode; // Optional: for an icon
  colorClass?: string; // Optional: Tailwind color class for emphasis
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, unit, icon, colorClass = 'text-sky-400' }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
      {icon && <div className="mb-2 text-3xl text-slate-500">{icon}</div>}
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
      <p className={`text-2xl font-bold ${colorClass} mt-1`}>
        {typeof value === 'number' ? value.toFixed(2) : value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
};