import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Workflow, WorkflowNode, Connection, NodeTemplate, TestRun, TestResult, InsertWorkflow } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkflowContextType {
  workflow: Workflow | null;
  isLoading: boolean;
  selectedNodeId: string | null;
  isConnecting: boolean;
  connectingFromId: string | null;
  testRun: TestRun | null;
  isTestPanelOpen: boolean;
  canvasOffset: { x: number; y: number };
  zoom: number;
  setWorkflow: (workflow: Workflow) => void;
  addNode: (template: NodeTemplate, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  startConnection: (nodeId: string) => void;
  completeConnection: (targetId: string) => void;
  cancelConnection: () => void;
  deleteConnection: (connectionId: string) => void;
  updateWorkflowName: (name: string) => void;
  saveWorkflow: () => void;
  runTest: () => void;
  setTestPanelOpen: (open: boolean) => void;
  setCanvasOffset: (offset: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  isSaving: boolean;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }
  return context;
}

const emptyWorkflow: Workflow = {
  id: "",
  name: "New Agent Workflow",
  description: "Configure your AI agent workflow",
  nodes: [],
  connections: [],
  status: "draft",
};

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [localWorkflow, setLocalWorkflow] = useState<Workflow | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [isTestPanelOpen, setTestPanelOpen] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflow: InsertWorkflow) => {
      const response = await apiRequest("POST", "/api/workflows", workflow);
      return response.json();
    },
    onSuccess: (data) => {
      setLocalWorkflow(data);
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow created",
        description: "Your workflow has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertWorkflow> }) => {
      const response = await apiRequest("PATCH", `/api/workflows/${id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      setLocalWorkflow(data);
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (workflows && workflows.length > 0 && !localWorkflow) {
      setLocalWorkflow(workflows[0]);
    } else if (workflows && workflows.length === 0 && !localWorkflow) {
      setLocalWorkflow({ ...emptyWorkflow, id: "temp-" + Date.now() });
    }
  }, [workflows, localWorkflow]);

  const workflow = localWorkflow;

  const saveWorkflow = useCallback(() => {
    if (!workflow) return;

    if (workflow.id.startsWith("temp-")) {
      const insertPayload: InsertWorkflow = {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        connections: workflow.connections,
        status: workflow.status,
      };
      createWorkflowMutation.mutate(insertPayload);
    } else {
      const updatePayload: Partial<InsertWorkflow> = {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        connections: workflow.connections,
        status: workflow.status,
      };
      updateWorkflowMutation.mutate({ id: workflow.id, updates: updatePayload });
    }
  }, [workflow, createWorkflowMutation, updateWorkflowMutation]);

  const addNode = useCallback((template: NodeTemplate, position: { x: number; y: number }) => {
    if (!workflow) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      category: template.category,
      name: template.name,
      icon: template.icon,
      description: template.description,
      position,
      config: { ...template.defaultConfig },
    };
    setLocalWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    });
    setSelectedNodeId(newNode.id);
  }, [workflow]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!workflow) return;

    setLocalWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    });
  }, [workflow]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!workflow) return;

    setLocalWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter((node) => node.id !== nodeId),
      connections: workflow.connections.filter(
        (conn) => conn.sourceId !== nodeId && conn.targetId !== nodeId
      ),
    });
    setSelectedNodeId(null);
  }, [workflow]);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const startConnection = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectingFromId(nodeId);
  }, []);

  const completeConnection = useCallback((targetId: string) => {
    if (!workflow || !connectingFromId || connectingFromId === targetId) {
      setIsConnecting(false);
      setConnectingFromId(null);
      return;
    }

    const existingConnection = workflow.connections.find(
      (conn) => conn.sourceId === connectingFromId && conn.targetId === targetId
    );

    if (!existingConnection) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        sourceId: connectingFromId,
        targetId,
        sourcePort: "output",
        targetPort: "input",
      };
      setLocalWorkflow({
        ...workflow,
        connections: [...workflow.connections, newConnection],
      });
    }

    setIsConnecting(false);
    setConnectingFromId(null);
  }, [workflow, connectingFromId]);

  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectingFromId(null);
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    if (!workflow) return;

    setLocalWorkflow({
      ...workflow,
      connections: workflow.connections.filter((conn) => conn.id !== connectionId),
    });
  }, [workflow]);

  const updateWorkflowName = useCallback((name: string) => {
    if (!workflow) return;
    setLocalWorkflow({ ...workflow, name });
  }, [workflow]);

  const runTest = useCallback(() => {
    if (!workflow || workflow.nodes.length === 0) {
      toast({
        title: "Cannot run test",
        description: "Add some nodes to your workflow first.",
        variant: "destructive",
      });
      return;
    }

    const run: TestRun = {
      id: `run-${Date.now()}`,
      workflowId: workflow.id,
      status: "running",
      results: workflow.nodes.map((node) => ({
        nodeId: node.id,
        status: "pending",
      })),
      startedAt: new Date().toISOString(),
    };
    setTestRun(run);
    setTestPanelOpen(true);

    let currentIndex = 0;
    const runNextNode = () => {
      if (currentIndex >= workflow.nodes.length) {
        setTestRun((prev) =>
          prev
            ? { ...prev, status: "completed", completedAt: new Date().toISOString() }
            : null
        );
        toast({
          title: "Test completed",
          description: "Workflow executed successfully.",
        });
        return;
      }

      const nodeId = workflow.nodes[currentIndex].id;
      setTestRun((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((r) =>
                r.nodeId === nodeId ? { ...r, status: "running" } : r
              ),
            }
          : null
      );

      setTimeout(() => {
        const success = Math.random() > 0.2;
        const result: TestResult = {
          nodeId,
          status: success ? "success" : "error",
          output: success ? { data: "Sample output data" } : undefined,
          error: success ? undefined : "Simulated error for testing",
          duration: Math.floor(Math.random() * 500) + 100,
        };

        setTestRun((prev) =>
          prev
            ? {
                ...prev,
                results: prev.results.map((r) =>
                  r.nodeId === nodeId ? result : r
                ),
                status: success ? prev.status : "failed",
              }
            : null
        );

        if (success) {
          currentIndex++;
          runNextNode();
        } else {
          setTestRun((prev) =>
            prev
              ? { ...prev, status: "failed", completedAt: new Date().toISOString() }
              : null
          );
          toast({
            title: "Test failed",
            description: `Node "${workflow.nodes[currentIndex].name}" encountered an error.`,
            variant: "destructive",
          });
        }
      }, Math.floor(Math.random() * 800) + 400);
    };

    runNextNode();
  }, [workflow, toast]);

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        isLoading: isLoadingWorkflows,
        selectedNodeId,
        isConnecting,
        connectingFromId,
        testRun,
        isTestPanelOpen,
        canvasOffset,
        zoom,
        setWorkflow: setLocalWorkflow,
        addNode,
        updateNode,
        deleteNode,
        selectNode,
        startConnection,
        completeConnection,
        cancelConnection,
        deleteConnection,
        updateWorkflowName,
        saveWorkflow,
        runTest,
        setTestPanelOpen,
        setCanvasOffset,
        setZoom,
        isSaving: createWorkflowMutation.isPending || updateWorkflowMutation.isPending,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}
