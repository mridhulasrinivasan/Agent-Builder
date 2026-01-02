import { randomUUID } from "crypto";
import type { Workflow, InsertWorkflow, TestRun, TestResult } from "@shared/schema";

export interface IStorage {
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: string): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<boolean>;
  getTestRuns(workflowId: string): Promise<TestRun[]>;
  createTestRun(run: Omit<TestRun, "id">): Promise<TestRun>;
  updateTestRun(id: string, updates: Partial<TestRun>): Promise<TestRun | undefined>;
}

export class MemStorage implements IStorage {
  private workflows: Map<string, Workflow>;
  private testRuns: Map<string, TestRun>;

  constructor() {
    this.workflows = new Map();
    this.testRuns = new Map();

    const sampleWorkflow: Workflow = {
      id: "wf-sample",
      name: "Sample Email Agent",
      description: "An example workflow that processes incoming emails",
      nodes: [
        {
          id: "node-1",
          type: "trigger",
          category: "triggers",
          name: "Email Received",
          icon: "Mail",
          description: "Triggers when a new email arrives",
          position: { x: 100, y: 200 },
          config: { folder: "inbox" },
        },
        {
          id: "node-2",
          type: "action",
          category: "ai",
          name: "AI Classify",
          icon: "Tags",
          description: "Classify the email content",
          position: { x: 420, y: 200 },
          config: { categories: ["urgent", "newsletter", "spam"], inputPath: "data.body" },
        },
        {
          id: "node-3",
          type: "logic",
          category: "logic",
          name: "Condition",
          icon: "GitBranch",
          description: "Route based on classification",
          position: { x: 740, y: 200 },
          config: { condition: "classification === 'urgent'" },
        },
      ],
      connections: [
        { id: "conn-1", sourceId: "node-1", targetId: "node-2", sourcePort: "output", targetPort: "input" },
        { id: "conn-2", sourceId: "node-2", targetId: "node-3", sourcePort: "output", targetPort: "input" },
      ],
      status: "draft",
    };

    this.workflows.set(sampleWorkflow.id, sampleWorkflow);
  }

  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = `wf-${randomUUID()}`;
    const newWorkflow: Workflow = { ...workflow, id };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: string, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existing = this.workflows.get(id);
    if (!existing) return undefined;

    const updated: Workflow = { ...existing, ...updates, id };
    this.workflows.set(id, updated);
    return updated;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async getTestRuns(workflowId: string): Promise<TestRun[]> {
    return Array.from(this.testRuns.values()).filter(
      (run) => run.workflowId === workflowId
    );
  }

  async createTestRun(run: Omit<TestRun, "id">): Promise<TestRun> {
    const id = `run-${randomUUID()}`;
    const newRun: TestRun = { ...run, id };
    this.testRuns.set(id, newRun);
    return newRun;
  }

  async updateTestRun(id: string, updates: Partial<TestRun>): Promise<TestRun | undefined> {
    const existing = this.testRuns.get(id);
    if (!existing) return undefined;

    const updated: TestRun = { ...existing, ...updates, id };
    this.testRuns.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
