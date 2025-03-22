import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricRowProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  info?: string;
}

export default function MetricRow({ title, value, icon, info }: MetricRowProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {info && <HelpCircle size={16} className="text-gray-400" />}
          </div>
          {info && <p className="text-sm text-gray-500">{info}</p>}
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}