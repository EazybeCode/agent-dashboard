"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AgentList from "@/components/AgentList";
import PromptEditor from "@/components/PromptEditor";
import OutboundSettings from "@/components/OutboundSettings";
import AgentStatusCard from "@/components/AgentStatusCard";
import { agentApi, Agent, AgentRun } from "@/lib/api";

export default function AgentDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "prompts" | "outbound">("overview");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  // Get orgId from URL params or environment
  const orgId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("orgId") || "default"
    : "default";

  useEffect(() => {
    fetchAgents();
    fetchRecentRuns();
  }, [orgId]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getAgents(orgId);
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRuns = async () => {
    try {
      const data = await agentApi.getRecentRuns(orgId);
      setRecentRuns(data);
    } catch (error) {
      console.error("Failed to fetch recent runs:", error);
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleToggleAgent = async (agentId: string, newStatus: "active" | "paused") => {
    try {
      await agentApi.toggleAgent(agentId, newStatus, orgId);
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: newStatus } : a))
      );
    } catch (error) {
      console.error("Failed to toggle agent:", error);
    }
  };

  const handleTriggerRun = async (agentId: string, action: string) => {
    try {
      await agentApi.triggerRun(orgId, action);
      alert(`Triggered ${action} for org ${orgId}`);
      fetchRecentRuns();
    } catch (error) {
      console.error("Failed to trigger run:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-sm text-gray-500">
                Manage your AI agents and automation
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchAgents();
              fetchRecentRuns();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Agent List */}
        <aside className="w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <AgentList
            agents={agents}
            selectedAgent={selectedAgent}
            onSelect={handleAgentSelect}
            onToggle={handleToggleAgent}
            loading={loading}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedAgent ? (
            <>
              {/* Agent Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedAgent.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`flex items-center gap-1 text-sm ${
                          selectedAgent.status === "active"
                            ? "text-green-600"
                            : selectedAgent.status === "paused"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedAgent.status === "active" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : selectedAgent.status === "paused" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {selectedAgent.status.charAt(0).toUpperCase() +
                          selectedAgent.status.slice(1)}
                      </span>
                      {selectedAgent.lastRun && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          Last run: {new Date(selectedAgent.lastRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedAgent.id === "outbound-agent" && (
                      <>
                        <button
                          onClick={() =>
                            handleTriggerRun(selectedAgent.id, "prospecting")
                          }
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Run Prospecting
                        </button>
                        <button
                          onClick={() => handleTriggerRun(selectedAgent.id, "review")}
                          className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Run Review
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-6">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "prompts", label: "Prompts" },
                    { id: "outbound", label: "Outbound Settings" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`pb-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-6">
                    <AgentStatusCard
                      title="Success Rate"
                      value={`${selectedAgent.successRate || 0}%`}
                      icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                    />
                    <AgentStatusCard
                      title="Total Runs"
                      value={selectedAgent.totalRuns?.toString() || "0"}
                      icon={<Play className="h-5 w-5 text-blue-600" />}
                    />
                    <AgentStatusCard
                      title="Status"
                      value={
                        selectedAgent.status.charAt(0).toUpperCase() +
                        selectedAgent.status.slice(1)
                      }
                      icon={<Settings className="h-5 w-5 text-gray-600" />}
                    />
                  </div>

                  {/* Recent Runs */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Runs
                    </h3>
                    <div className="space-y-3">
                      {recentRuns
                        .filter((r) => r.agentId === selectedAgent.id)
                        .map((run) => (
                          <div
                            key={run.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {run.status === "success" ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : run.status === "failed" ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {run.details}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(run.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                run.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : run.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {run.status}
                            </span>
                          </div>
                        ))}
                      {recentRuns.filter((r) => r.agentId === selectedAgent.id)
                        .length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No recent runs
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "prompts" && (
                <PromptEditor agentId={selectedAgent.id} orgId={orgId} />
              )}

              {activeTab === "outbound" && (
                <OutboundSettings agentId={selectedAgent.id} orgId={orgId} />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
              <Bot className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">Select an agent to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
