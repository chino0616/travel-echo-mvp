import React from 'react';

export interface ProgressBarProps {
  progress: number;
  status?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  showPercentage = true
}) => {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full space-y-2">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-sm">
        {status && (
          <span className="text-gray-600">{status}</span>
        )}
        {showPercentage && (
          <span className="text-gray-500">{Math.round(percentage)}%</span>
        )}
      </div>
    </div>
  );
}; 