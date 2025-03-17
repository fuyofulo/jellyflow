"use client";

import React from "react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  connected?: boolean;
}

export function IntegrationCard({
  title,
  description,
  icon,
  connected,
}: IntegrationCardProps) {
  return (
    <div className="relative flex flex-col rounded-lg border bg-white p-4 shadow-sm">
      {connected && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-2 w-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Connected
        </div>
      )}
      <div className="mb-3 flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 p-1 text-blue-600">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-4 flex justify-between gap-3">
        <button className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
          {connected ? "Configure" : "Connect"}
        </button>
        <button className="flex items-center justify-center rounded-md border border-gray-300 px-2 hover:bg-gray-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
