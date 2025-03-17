"use client";

import React, { useState } from "react";
import { IntegrationCard } from "./IntegrationCard";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
}

export function IntegrationsGrid() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "gmail",
      name: "Gmail",
      description: "Connect your Gmail account",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      isConnected: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Connect your Slack workspace",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="3" height="8" x="13" y="2" rx="1.5" />
          <rect width="3" height="8" x="13" y="14" rx="1.5" />
          <rect
            width="3"
            height="8"
            x="2"
            y="13"
            rx="1.5"
            transform="rotate(-90 2 13)"
          />
          <rect
            width="3"
            height="8"
            x="14"
            y="13"
            rx="1.5"
            transform="rotate(-90 14 13)"
          />
          <path d="M2.5 9.5 9 6.5" />
          <path d="m15 6.5 6.5 3" />
          <path d="M2.5 14.5 9 17.5" />
          <path d="m15 17.5 6.5-3" />
        </svg>
      ),
      isConnected: false,
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Connect your Google Drive",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 17H7A5 5 0 0 1 7 7h2" />
          <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
          <line x1="8" x2="16" y1="12" y2="12" />
        </svg>
      ),
      isConnected: false,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Connect your Dropbox account",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20h20" />
          <path d="M5 20v-4a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v4" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      isConnected: false,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Connect your Trello boards",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <rect width="3" height="9" x="7" y="7" />
          <rect width="3" height="5" x="14" y="7" />
        </svg>
      ),
      isConnected: true,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Connect your GitHub repositories",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-2.5 w-2.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      ),
      isConnected: false,
    },
  ]);

  const handleConnect = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, isConnected: true }
          : integration
      )
    );
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, isConnected: false }
          : integration
      )
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          name={integration.name}
          description={integration.description}
          icon={integration.icon}
          isConnected={integration.isConnected}
          onConnect={() => handleConnect(integration.id)}
          onDisconnect={() => handleDisconnect(integration.id)}
        />
      ))}
    </div>
  );
}
