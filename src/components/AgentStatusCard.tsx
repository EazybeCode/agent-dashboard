"use client";

import { ReactNode } from "react";

interface AgentStatusCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  subtitle?: string;
}

export default function AgentStatusCard({
  title,
  value,
  icon,
  subtitle,
}: AgentStatusCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}
