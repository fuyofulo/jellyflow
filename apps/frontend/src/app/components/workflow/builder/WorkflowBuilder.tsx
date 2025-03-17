"use client";

import React, { useState } from "react";
import { Button } from "../../ui/Button";

interface Node {
  id: string;
  type: "trigger" | "action";
  title: string;
  description: string;
  x: number;
  y: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "trigger-1",
      type: "trigger",
      title: "New Email",
      description: "Trigger when a new email is received",
      x: 100,
      y: 100,
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleAddAction = () => {
    const newNode: Node = {
      id: `action-${nodes.length + 1}`,
      type: "action",
      title: "Send Message",
      description: "Send a message to a channel",
      x: 400,
      y: 100,
    };

    setNodes([...nodes, newNode]);

    // If a node is selected, create an edge from the selected node to the new node
    if (selectedNode) {
      const newEdge: Edge = {
        id: `edge-${edges.length + 1}`,
        source: selectedNode,
        target: newNode.id,
      };

      setEdges([...edges, newEdge]);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-semibold">Workflow Builder</h1>
          <p className="text-sm text-gray-500">Create and edit your workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button variant="primary" size="sm">
            Save Workflow
          </Button>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-64 border-r p-4">
          <div className="mb-4">
            <h2 className="mb-2 font-medium">Triggers</h2>
            <div className="space-y-2">
              <div className="cursor-pointer rounded-md border bg-white p-3 hover:border-blue-500">
                <h3 className="font-medium">New Email</h3>
                <p className="text-xs text-gray-500">
                  Trigger when a new email is received
                </p>
              </div>
              <div className="cursor-pointer rounded-md border bg-white p-3 hover:border-blue-500">
                <h3 className="font-medium">Form Submission</h3>
                <p className="text-xs text-gray-500">
                  Trigger when a form is submitted
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-2 font-medium">Actions</h2>
            <div className="space-y-2">
              <div
                className="cursor-pointer rounded-md border bg-white p-3 hover:border-blue-500"
                onClick={handleAddAction}
              >
                <h3 className="font-medium">Send Message</h3>
                <p className="text-xs text-gray-500">
                  Send a message to a channel
                </p>
              </div>
              <div className="cursor-pointer rounded-md border bg-white p-3 hover:border-blue-500">
                <h3 className="font-medium">Create Task</h3>
                <p className="text-xs text-gray-500">
                  Create a new task in a project
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative flex-1 bg-gray-100 p-4">
          {/* Canvas for workflow */}
          <div className="h-full w-full overflow-auto rounded-md bg-white p-4 shadow-sm">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-pointer rounded-md border p-3 shadow-sm ${
                  node.type === "trigger"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-green-50 border-green-200"
                } ${selectedNode === node.id ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: "180px",
                }}
                onClick={() => handleNodeClick(node.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase text-gray-500">
                    {node.type}
                  </span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-xs">
                    {node.type === "trigger" ? "T" : "A"}
                  </span>
                </div>
                <h3 className="mt-1 font-medium">{node.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{node.description}</p>
              </div>
            ))}

            {/* Render edges */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              {edges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const sourceX = sourceNode.x + 180; // Right side of source node
                const sourceY = sourceNode.y + 35; // Middle of source node
                const targetX = targetNode.x; // Left side of target node
                const targetY = targetNode.y + 35; // Middle of target node

                return (
                  <g key={edge.id}>
                    <path
                      d={`M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    <circle cx={targetX} cy={targetY} r="2.5" fill="#94a3b8" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
