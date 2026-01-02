import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type NodeType = "trigger" | "action" | "logic" | "end";

export type NodeCategory = 
  | "triggers" 
  | "integrations" 
  | "data" 
  | "logic" 
  | "ai" 
  | "output";

export const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type NodePosition = z.infer<typeof nodePositionSchema>;

export const nodeConfigSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]));

export type NodeConfig = z.infer<typeof nodeConfigSchema>;

export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["trigger", "action", "logic", "end"]),
  category: z.enum(["triggers", "integrations", "data", "logic", "ai", "output"]),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
  position: nodePositionSchema,
  config: nodeConfigSchema,
});

export type WorkflowNode = z.infer<typeof workflowNodeSchema>;

export const connectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  sourcePort: z.literal("output"),
  targetPort: z.literal("input"),
});

export type Connection = z.infer<typeof connectionSchema>;

export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  nodes: jsonb("nodes").notNull().default([]),
  connections: jsonb("connections").notNull().default([]),
  status: text("status").notNull().default("draft"),
});

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Workflow name is required"),
  description: z.string(),
  nodes: z.array(workflowNodeSchema),
  connections: z.array(connectionSchema),
  status: z.enum(["draft", "active", "paused"]),
});

export type Workflow = z.infer<typeof workflowSchema>;

export const insertWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().default(""),
  nodes: z.array(workflowNodeSchema).default([]),
  connections: z.array(connectionSchema).default([]),
  status: z.enum(["draft", "active", "paused"]).default("draft"),
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export const testResultSchema = z.object({
  nodeId: z.string(),
  status: z.enum(["pending", "running", "success", "error"]),
  output: z.unknown().optional(),
  error: z.string().optional(),
  duration: z.number().optional(),
});

export type TestResult = z.infer<typeof testResultSchema>;

export const testRunSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: z.enum(["running", "completed", "failed"]),
  results: z.array(testResultSchema),
  startedAt: z.string(),
  completedAt: z.string().optional(),
});

export type TestRun = z.infer<typeof testRunSchema>;

export interface NodeTemplate {
  type: NodeType;
  category: NodeCategory;
  name: string;
  icon: string;
  description: string;
  defaultConfig: NodeConfig;
}

export const nodeTemplates: NodeTemplate[] = [
  {
    type: "trigger",
    category: "triggers",
    name: "Webhook",
    icon: "Webhook",
    description: "Trigger on incoming webhook request",
    defaultConfig: { url: "", method: "POST" },
  },
  {
    type: "trigger",
    category: "triggers",
    name: "Schedule",
    icon: "Clock",
    description: "Run on a recurring schedule",
    defaultConfig: { cron: "0 9 * * *", timezone: "UTC" },
  },
  {
    type: "trigger",
    category: "triggers",
    name: "Manual",
    icon: "Play",
    description: "Manually trigger the workflow",
    defaultConfig: {},
  },
  {
    type: "action",
    category: "integrations",
    name: "HTTP Request",
    icon: "Globe",
    description: "Make an HTTP API call",
    defaultConfig: { url: "", method: "GET", headers: "{}", body: "" },
  },
  {
    type: "action",
    category: "integrations",
    name: "Slack",
    icon: "MessageSquare",
    description: "Send message to Slack",
    defaultConfig: { channel: "", message: "" },
  },
  {
    type: "action",
    category: "integrations",
    name: "Email",
    icon: "Mail",
    description: "Send an email",
    defaultConfig: { to: "", subject: "", body: "" },
  },
  {
    type: "action",
    category: "data",
    name: "Transform",
    icon: "Shuffle",
    description: "Transform data with JavaScript",
    defaultConfig: { code: "return data;" },
  },
  {
    type: "action",
    category: "data",
    name: "Filter",
    icon: "Filter",
    description: "Filter data based on conditions",
    defaultConfig: { condition: "" },
  },
  {
    type: "logic",
    category: "logic",
    name: "Condition",
    icon: "GitBranch",
    description: "Branch based on conditions",
    defaultConfig: { condition: "", trueLabel: "Yes", falseLabel: "No" },
  },
  {
    type: "logic",
    category: "logic",
    name: "Loop",
    icon: "Repeat",
    description: "Loop through array items",
    defaultConfig: { arrayPath: "data.items" },
  },
  {
    type: "logic",
    category: "logic",
    name: "Delay",
    icon: "Timer",
    description: "Wait for specified duration",
    defaultConfig: { seconds: 5 },
  },
  {
    type: "action",
    category: "ai",
    name: "AI Prompt",
    icon: "Sparkles",
    description: "Generate text with AI",
    defaultConfig: { prompt: "", model: "gpt-4" },
  },
  {
    type: "action",
    category: "ai",
    name: "AI Classify",
    icon: "Tags",
    description: "Classify content with AI",
    defaultConfig: { categories: [], inputPath: "data.text" },
  },
  {
    type: "end",
    category: "output",
    name: "Response",
    icon: "Send",
    description: "Return response to caller",
    defaultConfig: { statusCode: 200, body: "{}" },
  },
  {
    type: "end",
    category: "output",
    name: "Save to DB",
    icon: "Database",
    description: "Store data in database",
    defaultConfig: { table: "", data: "{}" },
  },
];
