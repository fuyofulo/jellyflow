"use client";

import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { IntegrationsGrid } from "../../components/integration/IntegrationsGrid";

export default function IntegrationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-sm text-gray-500">
            Connect your apps and services to create powerful workflows
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Popular Integrations</h2>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-2.5 top-2.5 h-2.5 w-2.5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search integrations..."
                className="h-9 w-full rounded-md border border-gray-300 bg-transparent pl-9 pr-4 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <IntegrationsGrid />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-medium">Integration Categories</h2>
            <div className="space-y-2">
              {[
                "Email & Messaging",
                "CRM & Sales",
                "Marketing",
                "Project Management",
                "Social Media",
                "File Storage",
                "Analytics",
                "Developer Tools",
              ].map((category) => (
                <div
                  key={category}
                  className="flex cursor-pointer items-center justify-between rounded-md border p-3 hover:border-blue-500"
                >
                  <p className="font-medium">{category}</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-medium">Recently Added</h2>
            <div className="space-y-4">
              {[
                {
                  name: "Notion",
                  description: "Connect your Notion workspace",
                  date: "Added 2 days ago",
                },
                {
                  name: "Airtable",
                  description: "Connect your Airtable bases",
                  date: "Added 5 days ago",
                },
                {
                  name: "Discord",
                  description: "Connect your Discord server",
                  date: "Added 1 week ago",
                },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-start gap-3 border-b pb-4 last:border-0"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100">
                    <span className="text-xs font-medium">
                      {integration.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-gray-500">
                      {integration.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {integration.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
