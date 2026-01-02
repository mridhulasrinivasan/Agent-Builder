import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkflowNode } from "./workflow-node";
import { useWorkflow } from "@/lib/workflow-context";
import type { NodeTemplate } from "@shared/schema";

interface WorkflowCanvasProps {
  draggingTemplate: NodeTemplate | null;
}

export function WorkflowCanvas({ draggingTemplate }: WorkflowCanvasProps) {
  const {
    workflow,
    isLoading,
    addNode,
    updateNode,
    selectNode,
    cancelConnection,
    isConnecting,
    connectingFromId,
    testRun,
    canvasOffset,
    setCanvasOffset,
    zoom,
    setZoom,
  } = useWorkflow();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const template = JSON.parse(data) as NodeTemplate;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - canvasOffset.x) / zoom - 128;
      const y = (e.clientY - rect.top - canvasOffset.y) / zoom - 40;

      addNode(template, { x, y });
    } catch (err) {
      console.error("Failed to parse dropped node template:", err);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectNode(null);
      if (isConnecting) {
        cancelConnection();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current && e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setCanvasOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggedNodeId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - canvasOffset.x) / zoom - dragOffset.x;
          const y = (e.clientY - rect.top - canvasOffset.y) / zoom - dragOffset.y;
          updateNode(draggedNodeId, { position: { x, y } });
        }
      }

      if (isConnecting && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - canvasOffset.x) / zoom,
          y: (e.clientY - rect.top - canvasOffset.y) / zoom,
        });
      }
    },
    [isPanning, panStart, draggedNodeId, dragOffset, canvasOffset, zoom, isConnecting, updateNode, setCanvasOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggedNodeId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!workflow) return;
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nodeX = node.position.x;
    const nodeY = node.position.y;
    const clickX = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const clickY = (e.clientY - rect.top - canvasOffset.y) / zoom;

    setDragOffset({ x: clickX - nodeX, y: clickY - nodeY });
    setDraggedNodeId(nodeId);
  };

  const zoomIn = () => setZoom(Math.min(zoom + 0.1, 2));
  const zoomOut = () => setZoom(Math.max(zoom - 0.1, 0.5));
  const fitToScreen = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const renderConnections = () => {
    if (!workflow) return null;

    return workflow.connections.map((conn) => {
      const sourceNode = workflow.nodes.find((n) => n.id === conn.sourceId);
      const targetNode = workflow.nodes.find((n) => n.id === conn.targetId);
      if (!sourceNode || !targetNode) return null;

      const x1 = sourceNode.position.x + 256;
      const y1 = sourceNode.position.y + 40;
      const x2 = targetNode.position.x;
      const y2 = targetNode.position.y + 40;

      const controlOffset = Math.min(Math.abs(x2 - x1) * 0.5, 100);
      const path = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

      return (
        <g key={conn.id}>
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            strokeOpacity={0.4}
            className="transition-opacity"
          />
          <path
            d={path}
            fill="none"
            stroke="transparent"
            strokeWidth={10}
            className="cursor-pointer"
            onClick={() => {}}
          />
        </g>
      );
    });
  };

  const renderConnectingLine = () => {
    if (!isConnecting || !connectingFromId || !workflow) return null;

    const sourceNode = workflow.nodes.find((n) => n.id === connectingFromId);
    if (!sourceNode) return null;

    const x1 = sourceNode.position.x + 256;
    const y1 = sourceNode.position.y + 40;
    const x2 = mousePos.x;
    const y2 = mousePos.y;

    const controlOffset = Math.min(Math.abs(x2 - x1) * 0.5, 100);
    const path = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

    return (
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeDasharray="6 4"
        className="animate-pulse"
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground" data-testid="text-loading">Loading workflow...</span>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">No workflow found</span>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        style={{
          backgroundImage: showGrid
            ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`
            : undefined,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
        }}
        data-testid="workflow-canvas"
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {renderConnections()}
          {renderConnectingLine()}
        </svg>

        <div
          className="absolute"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {workflow.nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              testResult={testRun?.results.find((r) => r.nodeId === node.id)}
              onStartDrag={(e) => handleNodeDragStart(node.id, e)}
            />
          ))}
        </div>

        {workflow.nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <Grid3X3 className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-muted-foreground" data-testid="text-empty-state-title">
                  Start building your agent
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-1" data-testid="text-empty-state-description">
                  Drag a trigger from the library to begin
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg bg-card/90 backdrop-blur border shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={zoomOut}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <span className="text-xs font-medium text-muted-foreground w-12 text-center" data-testid="text-zoom-level">
          {Math.round(zoom * 100)}%
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={zoomIn}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={fitToScreen}
              data-testid="button-fit-screen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to screen</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? "bg-muted" : ""}
              data-testid="button-toggle-grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle grid</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
