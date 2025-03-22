import { type FC } from 'react';

interface Integration {
  name: string;
  logo: string;
}

interface IntegrationSectionProps {
  integrations: Integration[];
}

const IntegrationSection: FC<IntegrationSectionProps> = ({ integrations }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Integrações Disponíveis
          </h2>
          <p className="mt-4 text-gray-600">
            Conecte-se com suas plataformas favoritas
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src={integration.logo}
                  alt={`${integration.name} logo`}
                  className="h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/logos/placeholder.svg';
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-center font-medium text-gray-900">{integration.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;