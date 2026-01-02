import { useState, useEffect } from "react";
import { Play, Save, ChevronDown, Settings, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { useWorkflow } from "@/lib/workflow-context";

export function WorkflowHeader() {
  const { workflow, isLoading, updateWorkflowName, runTest, setTestPanelOpen, saveWorkflow, isSaving } = useWorkflow();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (workflow) {
      setEditName(workflow.name);
    }
  }, [workflow?.name]);

  if (isLoading || !workflow) {
    return (
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline" data-testid="text-app-name">AgentFlow</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>
    );
  }

  const handleNameSubmit = () => {
    if (editName.trim()) {
      updateWorkflowName(editName.trim());
    }
    setIsEditing(false);
  };

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-green-500/10 text-green-600 dark:text-green-400",
    paused: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 gap-4 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline" data-testid="text-app-name">AgentFlow</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="h-8 w-48 text-sm font-medium"
              autoFocus
              data-testid="input-workflow-name"
            />
          ) : (
            <button
              onClick={() => {
                setEditName(workflow.name);
                setIsEditing(true);
              }}
              className="text-sm font-semibold hover-elevate active-elevate-2 px-2 py-1 rounded-md"
              data-testid="button-edit-workflow-name"
            >
              {workflow.name}
            </button>
          )}
          <Badge
            variant="secondary"
            className={`text-xs uppercase tracking-wide ${statusColors[workflow.status]}`}
            data-testid="badge-workflow-status"
          >
            {workflow.status}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTestPanelOpen(true)}
          data-testid="button-open-settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={saveWorkflow}
          disabled={isSaving}
          data-testid="button-save-workflow"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" data-testid="button-test-workflow">
              <Play className="h-4 w-4 mr-2" />
              Test
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                runTest();
              }}
              data-testid="menu-item-run-test"
            >
              Run with sample data
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-item-configure-test">
              Configure test input
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border ml-2" />

        <ThemeToggle />
      </div>
    </header>
  );
}
