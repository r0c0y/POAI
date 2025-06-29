import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  voiceCommand?: string;
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  hover = true,
  gradient = false,
  padding = 'md',
  onClick,
  voiceCommand
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const baseClasses = clsx(
    'bg-white rounded-3xl shadow-lg border border-gray-100',
    gradient && 'bg-gradient-to-br from-white to-gray-50',
    hover && 'hover:shadow-xl transition-all duration-300',
    onClick && 'cursor-pointer',
    paddingClasses[padding],
    className
  );

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <CardComponent
      className={baseClasses}
      onClick={onClick}
      data-voice-command={voiceCommand}
      {...motionProps}
    >
      {children}
    </CardComponent>
  );
};

export default ModernCard;