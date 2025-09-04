import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClick?: () => void;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  onClick,
  gradient 
}) => {
  return (
    <div 
      className={`card cursor-pointer transform hover:scale-105 transition-all duration-200 ${gradient} text-white shadow-lg`}
      onClick={onClick}
    >
      <div className="card-body items-center text-center p-8">
        <div className="mb-4">
          <Icon className="h-12 w-12" />
        </div>
        <h3 className="card-title text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
    </div>
  );
};

export default FeatureCard;