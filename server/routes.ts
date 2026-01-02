import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertWorkflowSchema, workflowSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const result = insertWorkflowSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const workflow = await storage.createWorkflow(result.data);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const partialSchema = insertWorkflowSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const workflow = await storage.updateWorkflow(req.params.id, result.data);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workflow" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkflow(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  app.post("/api/workflows/:id/test", async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const testRun = await storage.createTestRun({
        workflowId: req.params.id,
        status: "running",
        results: workflow.nodes.map((node) => ({
          nodeId: node.id,
          status: "pending" as const,
        })),
        startedAt: new Date().toISOString(),
      });

      setTimeout(async () => {
        const results = workflow.nodes.map((node) => ({
          nodeId: node.id,
          status: (Math.random() > 0.2 ? "success" : "error") as const,
          output: { data: "Sample output" },
          duration: Math.floor(Math.random() * 500) + 100,
        }));

        const hasFailed = results.some((r) => r.status === "error");

        await storage.updateTestRun(testRun.id, {
          status: hasFailed ? "failed" : "completed",
          results,
          completedAt: new Date().toISOString(),
        });
      }, 2000);

      res.status(201).json(testRun);
    } catch (error) {
      res.status(500).json({ error: "Failed to start test run" });
    }
  });

  app.get("/api/workflows/:id/tests", async (req, res) => {
    try {
      const testRuns = await storage.getTestRuns(req.params.id);
      res.json(testRuns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  return httpServer;
}
