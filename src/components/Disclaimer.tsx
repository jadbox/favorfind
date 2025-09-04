import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Disclaimer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>
            Medeligo is for informational purposes only and is not intended for diagnosis, treatment, or medical decision-making.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Disclaimer;