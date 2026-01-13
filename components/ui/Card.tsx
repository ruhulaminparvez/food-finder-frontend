'use client';

import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface CardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export default function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <motion.div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { y: -4 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
