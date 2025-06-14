import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { AggregatedData } from '../types';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';


interface MetricChartProps {
  data: AggregatedData[];
  dataKeyY: keyof AggregatedData; // The value to plot on Y axis
  dataKeyX: keyof AggregatedData; // The value for X axis labels (usually 'period')
  chartType: 'bar' | 'line';
  title: string;
  yAxisLabel?: string;
  color: string; // e.g., "#8884d8"
}

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 text-slate-200 p-3 rounded shadow-lg border border-slate-600">
        <p className="label font-semibold">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={`item-${index}`} style={{ color: pld.color }}>
            {`${pld.name}: ${typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export const MetricChart: React.FC<MetricChartProps> = ({ data, dataKeyY, dataKeyX, chartType, title, yAxisLabel, color }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 p-4">{title}: Nema podataka za prikaz.</div>;
  }
  
  // Recharts expects data to be sorted for line charts for proper rendering. Bar charts are fine.
  // Data is already sorted by period descending from aggregation, for charts better to have ascending.
  const chartData = [...data].reverse();


  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold text-sky-400 mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey={dataKeyX as string} tick={{ fill: '#94a3b8' }} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', dy:40 }} tick={{ fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }} />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Bar dataKey={dataKeyY as string} fill={color} name={yAxisLabel || dataKeyY as string}/>
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey={dataKeyX as string} tick={{ fill: '#94a3b8' }} />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', dy:40 }} tick={{ fill: '#94a3b8' }}/>
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(71, 85, 105, 0.5)', strokeWidth: 1 }} />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Line type="monotone" dataKey={dataKeyY as string} stroke={color} activeDot={{ r: 8 }} name={yAxisLabel || dataKeyY as string}/>
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};