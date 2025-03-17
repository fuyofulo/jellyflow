"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

type TemplateUser = {
  [key: string]: number;
};

export default function DashboardPage() {
  const [templateUsers, setTemplateUsers] = useState<TemplateUser>({});

  useEffect(() => {
    // Generate random user counts on client-side only
    const templates = [
      "Gmail to Slack",
      "Form to Google Sheets",
      "Twitter to CRM",
      "Invoice Generator",
    ];
    const userCounts = templates.reduce((acc, template) => {
      acc[template] = Math.floor(Math.random() * 1000) + 100;
      return acc;
    }, {} as TemplateUser);

    setTemplateUsers(userCounts);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back! Here&apos;s an overview of your workflow automation
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Workflows",
              value: "12",
              change: "+2",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              ),
            },
            {
              title: "Active Integrations",
              value: "8",
              change: "+1",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 3v2" />
                  <path d="M19 6v2" />
                  <path d="M5 6v2" />
                  <path d="M12 19v2" />
                  <path d="M19 16v2" />
                  <path d="M5 16v2" />
                  <path d="M5 12h14" />
                </svg>
              ),
            },
            {
              title: "Tasks Executed",
              value: "748",
              change: "+57",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 2v20" />
                  <path d="m17 5-5-3-5 3" />
                  <path d="m17 19-5 3-5-3" />
                  <path d="M5 12H2" />
                  <path d="M22 12h-3" />
                </svg>
              ),
            },
            {
              title: "Success Rate",
              value: "99.2%",
              change: "+0.5%",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <span className="ml-2 text-xs font-medium text-green-500">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-2 text-blue-500">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-medium">Popular Templates</h2>
            <div className="space-y-4">
              {[
                {
                  name: "Gmail to Slack",
                  description:
                    "Send Slack notifications for new important emails",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  ),
                },
                {
                  name: "Form to Google Sheets",
                  description:
                    "Save form submissions directly to Google Sheets",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                      <line x1="10" x2="8" y1="9" y2="9" />
                    </svg>
                  ),
                },
                {
                  name: "Twitter to CRM",
                  description: "Add new Twitter followers to your CRM",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ),
                },
                {
                  name: "Invoice Generator",
                  description:
                    "Create and send invoices when new deals are closed",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <rect width="16" height="20" x="4" y="2" rx="2" />
                      <line x1="12" x2="12" y1="6" y2="10" />
                      <line x1="12" x2="12" y1="14" y2="18" />
                      <line x1="8" x2="16" y1="14" y2="14" />
                      <line x1="8" x2="16" y1="10" y2="10" />
                      <line x1="10" x2="14" y1="6" y2="6" />
                      <line x1="10" x2="14" y1="18" y2="18" />
                    </svg>
                  ),
                },
              ].map((template, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:border-blue-500"
                >
                  <div className="rounded-md bg-blue-50 p-2 text-blue-500">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex space-x-1">
                        <button className="rounded-md border p-1 hover:bg-gray-50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-2 w-2 text-gray-500"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                        <button className="rounded-md border p-1 hover:bg-gray-50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-2 w-2 text-gray-500"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {template.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Used by {templateUsers[template.name] || "-"} users
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-medium">Recent Activity</h2>
            <div className="space-y-4">
              {[
                {
                  title: "New workflow created",
                  description: "You created a new workflow 'Email to CRM'",
                  time: "2 hours ago",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  ),
                },
                {
                  title: "Google Drive integration",
                  description: "Connected your Google Drive account",
                  time: "Yesterday",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <path d="M9 19h6" />
                      <path d="M9 15v-3H5l-3 3v4h6v-4" />
                      <path d="M9 12V8h10l3 3v4h-6v-3" />
                      <path d="M9 8V4h6" />
                    </svg>
                  ),
                },
                {
                  title: "Task execution error",
                  description:
                    "Failed to send email in 'Weekly Report' workflow",
                  time: "2 days ago",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                  ),
                },
                {
                  title: "Workflow updated",
                  description: "Made changes to 'Customer Onboarding' workflow",
                  time: "3 days ago",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2.5 w-2.5"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  ),
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {activity.time}
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
