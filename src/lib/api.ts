// API service for mcp-agent backend

const API_BASE_URL = process.env.NEXT_PUBLIC_MCP_AGENT_URL || "http://localhost:8000";

export interface Agent {
  id: string;
  name: string;
  status: "active" | "paused" | "error";
  lastRun?: string;
  successRate?: number;
  totalRuns?: number;
}

export interface AgentRun {
  id: string;
  agentId: string;
  status: "success" | "failed" | "running";
  timestamp: string;
  details: string;
}

export interface OutboundConfig {
  enabled: boolean;
  timezone: string;
  prospecting_time: string;
  followup_time: string;
  review_time: string;
  daily_prospect_limit: number;
  icp: {
    titles: string[];
    seniorities: string[];
    locations: string[];
    industries: string[];
    employee_count_min?: number;
    employee_count_max?: number;
    keywords: string[];
  };
  campaign_ids: string[];
}

export interface Prompt {
  name: string;
  content: string;
  version: number;
  updatedAt: string;
}

// Mock data for development (replace with real API calls)
const MOCK_AGENTS: Agent[] = [
  {
    id: "eazybe-sales-agent",
    name: "Eazybe Sales Agent",
    status: "active",
    lastRun: new Date().toISOString(),
    successRate: 95,
    totalRuns: 150,
  },
  {
    id: "outbound-agent",
    name: "Outbound Prospecting Agent",
    status: "active",
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    successRate: 88,
    totalRuns: 45,
  },
];

const MOCK_RUNS: AgentRun[] = [
  {
    id: "run-1",
    agentId: "outbound-agent",
    status: "success",
    timestamp: new Date().toISOString(),
    details: "Prospecting: 25 searched, 18 added to campaign",
  },
  {
    id: "run-2",
    agentId: "outbound-agent",
    status: "success",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: "Follow-up check: 5 new connections, 12 pending",
  },
  {
    id: "run-3",
    agentId: "eazybe-sales-agent",
    status: "success",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: "Processed 8 HubSpot queries successfully",
  },
];

export const agentApi = {
  // Get all agents for an org
  async getAgents(orgId: string): Promise<Agent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents?orgId=${orgId}`);
      if (!response.ok) throw new Error("Failed to fetch agents");
      return await response.json();
    } catch (error) {
      console.warn("Using mock data for agents:", error);
      return MOCK_AGENTS;
    }
  },

  // Get recent runs for an org
  async getRecentRuns(orgId: string): Promise<AgentRun[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/runs?orgId=${orgId}`);
      if (!response.ok) throw new Error("Failed to fetch runs");
      return await response.json();
    } catch (error) {
      console.warn("Using mock data for runs:", error);
      return MOCK_RUNS;
    }
  },

  // Toggle agent status
  async toggleAgent(agentId: string, status: "active" | "paused", orgId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/agents/${agentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, orgId }),
    });
    if (!response.ok) throw new Error("Failed to toggle agent");
  },

  // Trigger a manual run
  async triggerRun(orgId: string, action: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/outbound/${action}/trigger/${orgId}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error("Failed to trigger run");
  },

  // Get outbound settings
  async getOutboundSettings(orgId: string): Promise<OutboundConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/outbound/settings/${orgId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch outbound settings:", error);
      return null;
    }
  },

  // Update outbound settings
  async updateOutboundSettings(orgId: string, config: OutboundConfig): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/outbound/settings/${orgId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error("Failed to update settings");
  },

  // Get prompt for an agent
  async getPrompt(agentId: string, orgId: string): Promise<Prompt | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/prompts/${agentId}?orgId=${orgId}`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn("Failed to fetch prompt:", error);
      return null;
    }
  },

  // Update prompt for an agent
  async updatePrompt(agentId: string, content: string, orgId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${agentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, orgId }),
    });
    if (!response.ok) throw new Error("Failed to update prompt");
  },
};
