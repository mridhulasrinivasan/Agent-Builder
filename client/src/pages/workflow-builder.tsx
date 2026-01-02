import { useState } from "react";
import { WorkflowHeader } from "@/components/workflow-header";
import { NodeLibrary } from "@/components/node-library";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { SettingsPanel } from "@/components/settings-panel";
import { TestPanel } from "@/components/test-panel";
import { WorkflowProvider, useWorkflow } from "@/lib/workflow-context";
import type { NodeTemplate } from "@shared/schema";
import { Loader2 } from "lucide-react";

function WorkflowBuilderContent() {
  const [draggingTemplate, setDraggingTemplate] = useState<NodeTemplate | null>(null);
  const { workflow, isLoading } = useWorkflow();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <WorkflowHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground" data-testid="text-loading">Loading workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkflowHeader />
      <div className="flex-1 flex overflow-hidden relative">
        <NodeLibrary onDragStart={setDraggingTemplate} />
        <WorkflowCanvas draggingTemplate={draggingTemplate} />
        <SettingsPanel />
        <TestPanel />
      </div>
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <WorkflowProvider>
      <WorkflowBuilderContent />
    </WorkflowProvider>
  );
}
