"use client";

import { useState, useEffect } from "react";
import { Save, Clock, Users, Target, MapPin, Building, Hash } from "lucide-react";
import { agentApi, OutboundConfig } from "@/lib/api";

interface OutboundSettingsProps {
  agentId: string;
  orgId: string;
}

const DEFAULT_CONFIG: OutboundConfig = {
  enabled: false,
  timezone: "America/New_York",
  prospecting_time: "09:00",
  followup_time: "14:00",
  review_time: "17:00",
  daily_prospect_limit: 25,
  icp: {
    titles: [],
    seniorities: [],
    locations: [],
    industries: [],
    keywords: [],
  },
  campaign_ids: [],
};

export default function OutboundSettings({ agentId, orgId }: OutboundSettingsProps) {
  const [config, setConfig] = useState<OutboundConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state for array inputs
  const [titlesInput, setTitlesInput] = useState("");
  const [senioritiesInput, setSenioritiesInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");
  const [industriesInput, setIndustriesInput] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [campaignIdsInput, setCampaignIdsInput] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [agentId, orgId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await agentApi.getOutboundSettings(orgId);
      if (data) {
        setConfig(data);
        setTitlesInput(data.icp.titles.join(", "));
        setSenioritiesInput(data.icp.seniorities.join(", "));
        setLocationsInput(data.icp.locations.join(", "));
        setIndustriesInput(data.icp.industries.join(", "));
        setKeywordsInput(data.icp.keywords.join(", "));
        setCampaignIdsInput(data.campaign_ids.join(", "));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedConfig: OutboundConfig = {
        ...config,
        icp: {
          ...config.icp,
          titles: titlesInput.split(",").map((s) => s.trim()).filter(Boolean),
          seniorities: senioritiesInput.split(",").map((s) => s.trim()).filter(Boolean),
          locations: locationsInput.split(",").map((s) => s.trim()).filter(Boolean),
          industries: industriesInput.split(",").map((s) => s.trim()).filter(Boolean),
          keywords: keywordsInput.split(",").map((s) => s.trim()).filter(Boolean),
        },
        campaign_ids: campaignIdsInput.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await agentApi.updateOutboundSettings(orgId, updatedConfig);
      setConfig(updatedConfig);
      setHasChanges(false);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = <K extends keyof OutboundConfig>(key: K, value: OutboundConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Outbound Automation
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Enable automated prospecting and follow-ups
            </p>
          </div>
          <button
            onClick={() => updateConfig("enabled", !config.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.enabled ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={config.timezone}
              onChange={(e) => updateConfig("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Asia/Kolkata">India Standard Time</option>
              <option value="Europe/London">London Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Prospect Limit
            </label>
            <input
              type="number"
              value={config.daily_prospect_limit}
              onChange={(e) =>
                updateConfig("daily_prospect_limit", parseInt(e.target.value) || 25)
              }
              min={1}
              max={100}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prospecting Time
            </label>
            <input
              type="time"
              value={config.prospecting_time}
              onChange={(e) => updateConfig("prospecting_time", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Time
            </label>
            <input
              type="time"
              value={config.followup_time}
              onChange={(e) => updateConfig("followup_time", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Time
            </label>
            <input
              type="time"
              value={config.review_time}
              onChange={(e) => updateConfig("review_time", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ICP Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Ideal Customer Profile (ICP)
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Users className="h-4 w-4" />
              Job Titles
            </label>
            <input
              type="text"
              value={titlesInput}
              onChange={(e) => {
                setTitlesInput(e.target.value);
                setHasChanges(true);
              }}
              placeholder="CEO, CTO, VP of Sales, Head of Growth..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated values</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Hash className="h-4 w-4" />
              Seniorities
            </label>
            <input
              type="text"
              value={senioritiesInput}
              onChange={(e) => {
                setSenioritiesInput(e.target.value);
                setHasChanges(true);
              }}
              placeholder="C-Level, VP, Director, Manager..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin className="h-4 w-4" />
              Locations
            </label>
            <input
              type="text"
              value={locationsInput}
              onChange={(e) => {
                setLocationsInput(e.target.value);
                setHasChanges(true);
              }}
              placeholder="United States, United Kingdom, Germany..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Building className="h-4 w-4" />
              Industries
            </label>
            <input
              type="text"
              value={industriesInput}
              onChange={(e) => {
                setIndustriesInput(e.target.value);
                setHasChanges(true);
              }}
              placeholder="SaaS, Technology, E-commerce..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => {
                setKeywordsInput(e.target.value);
                setHasChanges(true);
              }}
              placeholder="AI, automation, productivity..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Employees
              </label>
              <input
                type="number"
                value={config.icp.employee_count_min || ""}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    icp: {
                      ...prev.icp,
                      employee_count_min: parseInt(e.target.value) || undefined,
                    },
                  }));
                  setHasChanges(true);
                }}
                placeholder="10"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Employees
              </label>
              <input
                type="number"
                value={config.icp.employee_count_max || ""}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    icp: {
                      ...prev.icp,
                      employee_count_max: parseInt(e.target.value) || undefined,
                    },
                  }));
                  setHasChanges(true);
                }}
                placeholder="500"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign IDs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Aimfox Campaign IDs
        </h3>
        <input
          type="text"
          value={campaignIdsInput}
          onChange={(e) => {
            setCampaignIdsInput(e.target.value);
            setHasChanges(true);
          }}
          placeholder="campaign-id-1, campaign-id-2..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Comma-separated Aimfox campaign IDs for lead import
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
            hasChanges && !saving
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
