import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Platform } from '../data/platforms';

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform | null;
  onSubmit: (data: Record<string, string>) => void;
}

export default function PlatformModal({ isOpen, onClose, platform, onSubmit }: PlatformModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (!isOpen || !platform) return null;

  const Icon = platform.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 rounded-xl ${platform.color} text-white`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Conectar {platform.name}
              </h3>
              <p className="text-sm text-gray-500">{platform.category}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {platform.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            ))}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none ${platform.color} hover:opacity-90`}
              >
                Conectar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}