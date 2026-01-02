import { useRef } from "react";
import {
  Webhook,
  Clock,
  Play,
  Globe,
  MessageSquare,
  Mail,
  Shuffle,
  Filter,
  GitBranch,
  Repeat,
  Timer,
  Sparkles,
  Tags,
  Send,
  Database,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkflowNode as WorkflowNodeType, TestResult } from "@shared/schema";
import { useWorkflow } from "@/lib/workflow-context";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof Webhook> = {
  Webhook,
  Clock,
  Play,
  Globe,
  MessageSquare,
  Mail,
  Shuffle,
  Filter,
  GitBranch,
  Repeat,
  Timer,
  Sparkles,
  Tags,
  Send,
  Database,
};

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  testResult?: TestResult;
  onStartDrag: (e: React.MouseEvent) => void;
}

export function WorkflowNode({ node, testResult, onStartDrag }: WorkflowNodeProps) {
  const {
    selectedNodeId,
    selectNode,
    deleteNode,
    startConnection,
    completeConnection,
    isConnecting,
    connectingFromId,
  } = useWorkflow();
  const nodeRef = useRef<HTMLDivElement>(null);

  const Icon = iconMap[node.icon] || Webhook;
  const isSelected = selectedNodeId === node.id;
  const isConnectingFrom = connectingFromId === node.id;

  const typeStyles = {
    trigger: {
      border: "border-green-500/40",
      bg: "bg-green-500/5",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      leftRadius: "rounded-l-full",
    },
    action: {
      border: "border-blue-500/40",
      bg: "bg-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      leftRadius: "rounded-l-lg",
    },
    logic: {
      border: "border-purple-500/40",
      bg: "bg-purple-500/5",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      leftRadius: "rounded-l-lg",
    },
    end: {
      border: "border-orange-500/40",
      bg: "bg-orange-500/5",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      leftRadius: "rounded-l-lg",
    },
  };

  const styles = typeStyles[node.type];

  const statusIndicator = () => {
    if (!testResult) return null;

    const statusIcons = {
      pending: <div className="w-2 h-2 rounded-full bg-muted-foreground" />,
      running: <Loader2 className="w-3 h-3 animate-spin text-blue-500" />,
      success: <Check className="w-3 h-3 text-green-500" />,
      error: <AlertCircle className="w-3 h-3 text-red-500" />,
    };

    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border flex items-center justify-center">
        {statusIcons[testResult.status]}
      </div>
    );
  };

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute min-w-64 bg-card border-2 rounded-lg shadow-sm transition-shadow cursor-move select-none",
        styles.border,
        isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background shadow-md",
        isConnectingFrom && "ring-2 ring-primary"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isConnecting && connectingFromId !== node.id) {
          completeConnection(node.id);
        } else {
          selectNode(node.id);
        }
      }}
      onMouseDown={onStartDrag}
      data-testid={`workflow-node-${node.id}`}
    >
      {statusIndicator()}

      {node.type !== "trigger" && (
        <button
          className={cn(
            "absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card transition-colors",
            isConnecting && connectingFromId !== node.id
              ? "border-primary bg-primary/20 scale-125"
              : "border-muted-foreground/50 hover:border-primary hover:bg-primary/20"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (isConnecting) {
              completeConnection(node.id);
            }
          }}
          data-testid={`node-input-port-${node.id}`}
        />
      )}

      {node.type !== "end" && (
        <button
          className={cn(
            "absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-card transition-colors",
            isConnectingFrom
              ? "border-primary bg-primary scale-125"
              : "border-muted-foreground/50 hover:border-primary hover:bg-primary/20"
          )}
          onClick={(e) => {
            e.stopPropagation();
            startConnection(node.id);
          }}
          data-testid={`node-output-port-${node.id}`}
        />
      )}

      <div className={cn("flex items-center gap-3 p-3", styles.bg)}>
        <div
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {node.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {node.description}
          </div>
        </div>
        {isSelected && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0 opacity-60 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            data-testid={`button-delete-node-${node.id}`}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {Object.keys(node.config).length > 0 && (
        <div className="px-3 pb-2 space-y-1">
          {Object.entries(node.config)
            .slice(0, 2)
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="text-foreground truncate font-mono text-[11px]">
                  {String(value) || "—"}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
