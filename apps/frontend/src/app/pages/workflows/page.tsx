"use client";

import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/Button";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  lastRun: string;
  tasks: number;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "wf-1",
      name: "Email to Slack",
      description: "Send new emails to Slack channel",
      status: "active",
      lastRun: "2 minutes ago",
      tasks: 128,
    },
    {
      id: "wf-2",
      name: "Form to CRM",
      description: "Add form submissions to CRM",
      status: "active",
      lastRun: "1 hour ago",
      tasks: 56,
    },
    {
      id: "wf-3",
      name: "Invoice Generator",
      description: "Generate invoices from new orders",
      status: "inactive",
      lastRun: "3 days ago",
      tasks: 42,
    },
    {
      id: "wf-4",
      name: "Lead Notification",
      description: "Send notifications for new leads",
      status: "active",
      lastRun: "Yesterday",
      tasks: 89,
    },
    {
      id: "wf-5",
      name: "Weekly Report",
      description: "Generate and send weekly reports",
      status: "draft",
      lastRun: "Never",
      tasks: 0,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "draft">(
    "all"
  );

  const filteredWorkflows = workflows.filter((workflow) => {
    if (filter === "all") return true;
    return workflow.status === filter;
  });

  const toggleStatus = (id: string) => {
    setWorkflows(
      workflows.map((workflow) => {
        if (workflow.id === id) {
          const newStatus =
            workflow.status === "active" ? "inactive" : "active";
          return { ...workflow, status: newStatus };
        }
        return workflow;
      })
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Workflows</h1>
            <p className="text-sm text-gray-500">
              Manage and monitor your automated workflows
            </p>
          </div>
          <Button variant="primary">Create Workflow</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "inactive" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("inactive")}
          >
            Inactive
          </Button>
          <Button
            variant={filter === "draft" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("draft")}
          >
            Draft
          </Button>
        </div>

        <div className="rounded-lg border bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium text-gray-500">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Last Run</div>
            <div className="col-span-1">Tasks</div>
            <div className="col-span-2">Actions</div>
          </div>
          {filteredWorkflows.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No workflows found</p>
            </div>
          ) : (
            filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="grid grid-cols-12 gap-4 border-b p-4 last:border-0"
              >
                <div className="col-span-4">
                  <p className="font-medium">{workflow.name}</p>
                  <p className="text-sm text-gray-500">
                    {workflow.description}
                  </p>
                </div>
                <div className="col-span-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      workflow.status === "active"
                        ? "bg-green-100 text-green-800"
                        : workflow.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {workflow.status === "active" && (
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    )}
                    {workflow.status.charAt(0).toUpperCase() +
                      workflow.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-500">
                  {workflow.lastRun}
                </div>
                <div className="col-span-1 text-sm text-gray-500">
                  {workflow.tasks}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(workflow.id)}
                    disabled={workflow.status === "draft"}
                  >
                    {workflow.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
                    <span className="sr-only">More</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
