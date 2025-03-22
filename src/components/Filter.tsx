import { type FC } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const Filter: FC<FilterProps> = ({ label, value, onChange, options }) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default Filter;