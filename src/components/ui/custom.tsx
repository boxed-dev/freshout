import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Star, Clock, Shield } from 'lucide-react';

interface ProductBadgeProps {
  type: 'organic' | 'fresh' | 'premium' | 'guarantee';
  className?: string;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ type, className = '' }) => {
  const badges = {
    organic: {
      icon: Leaf,
      text: 'Organic',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    fresh: {
      icon: Clock,
      text: 'Fresh Today',
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    premium: {
      icon: Star,
      text: 'Premium',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    guarantee: {
      icon: Shield,
      text: 'Quality Guaranteed',
      className: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${badge.className} ${className}`}>
      <Icon className="w-3 h-3" />
      {badge.text}
    </span>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color?: 'emerald' | 'blue' | 'orange' | 'purple';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  color = 'emerald' 
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200',
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
    orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-2xl">
      <CardContent className="p-6 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${colorClasses[color]}`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-neutral-900">{title}</h3>
        <p className="text-neutral-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

interface GradientBackgroundProps {
  variant?: 'primary' | 'secondary' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  variant = 'neutral', 
  children, 
  className = '' 
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50',
    secondary: 'bg-gradient-to-br from-blue-50 via-white to-blue-50',
    neutral: 'bg-gradient-to-br from-neutral-50 to-neutral-100'
  };

  return (
    <div className={`min-h-screen ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-neutral-300 border-t-emerald-600`} />
  );
};

export const GlassCard = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 hover:border-neutral-300',
    ghost: 'hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export const FloatingActionButton = ({ 
  children, 
  onClick,
  className = ''
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-50 ${className}`}
    >
      {children}
    </button>
  );
};
