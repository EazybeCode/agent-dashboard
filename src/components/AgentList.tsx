"use client";

import { Bot, Play, Pause, AlertCircle } from "lucide-react";
import { Agent } from "@/lib/api";

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelect: (agent: Agent) => void;
  onToggle: (agentId: string, newStatus: "active" | "paused") => void;
  loading: boolean;
}

export default function AgentList({
  agents,
  selectedAgent,
  onSelect,
  onToggle,
  loading,
}: AgentListProps) {
  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Agents
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Agents ({agents.length})
      </h2>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelect(agent)}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedAgent?.id === agent.id
                ? "bg-blue-50 border-2 border-blue-500"
                : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    agent.status === "active"
                      ? "bg-green-100"
                      : agent.status === "paused"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <Bot
                    className={`h-5 w-5 ${
                      agent.status === "active"
                        ? "text-green-600"
                        : agent.status === "paused"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {agent.totalRuns || 0} runs | {agent.successRate || 0}% success
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(
                    agent.id,
                    agent.status === "active" ? "paused" : "active"
                  );
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  agent.status === "active"
                    ? "bg-green-100 hover:bg-green-200 text-green-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                title={agent.status === "active" ? "Pause agent" : "Activate agent"}
              >
                {agent.status === "active" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
            </div>
            {agent.status === "error" && (
              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                Error - check logs
              </div>
            )}
          </div>
        ))}
        {agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No agents configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
