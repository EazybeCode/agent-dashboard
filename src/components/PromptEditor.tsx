"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, FileText, Clock } from "lucide-react";
import { agentApi, Prompt } from "@/lib/api";

interface PromptEditorProps {
  agentId: string;
  orgId: string;
}

export default function PromptEditor({ agentId, orgId }: PromptEditorProps) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, [agentId, orgId]);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const data = await agentApi.getPrompt(agentId, orgId);
      if (data) {
        setPrompt(data);
        setContent(data.content);
      } else {
        // Default prompt template
        setContent(`You are an AI assistant helping with ${agentId} tasks.

## Instructions
- Be helpful and precise
- Follow user guidelines
- Maintain professional tone

## Context
Add your custom instructions here...`);
      }
    } catch (error) {
      console.error("Failed to fetch prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await agentApi.updatePrompt(agentId, content, orgId);
      setHasChanges(false);
      setPrompt((prev) =>
        prev
          ? { ...prev, content, version: prev.version + 1, updatedAt: new Date().toISOString() }
          : { name: agentId, content, version: 1, updatedAt: new Date().toISOString() }
      );
      alert("Prompt saved successfully!");
    } catch (error) {
      console.error("Failed to save prompt:", error);
      alert("Failed to save prompt. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (prompt) {
      setContent(prompt.content);
      setHasChanges(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== prompt?.content);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Agent Prompt</h3>
            {prompt && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                v{prompt.version} · Last updated:{" "}
                {new Date(prompt.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              hasChanges
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              hasChanges && !saving
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-200 text-blue-400 cursor-not-allowed"
            }`}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-96 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your prompt instructions..."
        />
        {hasChanges && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
              Unsaved changes
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Available Variables
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            "{{lead_name}}",
            "{{company_name}}",
            "{{industry}}",
            "{{title}}",
            "{{location}}",
            "{{mutual_connections}}",
          ].map((variable) => (
            <code
              key={variable}
              className="px-2 py-1 text-xs bg-white border border-gray-200 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => {
                setContent((prev) => prev + " " + variable);
                setHasChanges(true);
              }}
            >
              {variable}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
