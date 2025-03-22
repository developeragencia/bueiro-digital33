import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <HelpCircle size={16} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xl lg:text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-xs lg:text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value} em relação ao período anterior
          </p>
        )}
      </div>
    </div>
  );
}