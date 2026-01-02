import { X, Play, Check, AlertCircle, Loader2, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflow } from "@/lib/workflow-context";
import { cn } from "@/lib/utils";

export function TestPanel() {
  const { workflow, testRun, runTest, isTestPanelOpen, setTestPanelOpen } = useWorkflow();

  if (!isTestPanelOpen || !workflow) return null;

  const statusColors = {
    running: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  };

  const resultIcons = {
    pending: <div className="w-4 h-4 rounded-full bg-muted" />,
    running: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    success: <Check className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-80 bg-card border-t flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold" data-testid="text-test-panel-title">Test Workflow</h3>
          {testRun && (
            <Badge
              variant="outline"
              className={cn("text-xs", statusColors[testRun.status])}
              data-testid="badge-test-status"
            >
              {testRun.status === "running" && (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              )}
              {testRun.status.charAt(0).toUpperCase() + testRun.status.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={runTest}
            disabled={testRun?.status === "running" || workflow.nodes.length === 0}
            data-testid="button-run-test"
          >
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTestPanelOpen(false)}
            data-testid="button-close-test-panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="execution" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 w-fit">
          <TabsTrigger value="execution" data-testid="tab-execution">
            Execution
          </TabsTrigger>
          <TabsTrigger value="input" data-testid="tab-input">
            Test Input
          </TabsTrigger>
          <TabsTrigger value="output" data-testid="tab-output">
            Output
          </TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="flex-1 p-4 m-0">
          {workflow.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground" data-testid="text-no-nodes">
              Add nodes to your workflow to run a test
            </div>
          ) : !testRun ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground" data-testid="text-click-to-run">
              Click "Run Test" to execute your workflow
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {testRun.results.map((result, index) => {
                  const node = workflow.nodes.find((n) => n.id === result.nodeId);
                  if (!node) return null;

                  return (
                    <Card
                      key={result.nodeId}
                      className={cn(
                        "p-3 flex items-center gap-3",
                        result.status === "running" && "border-blue-500/30",
                        result.status === "success" && "border-green-500/30",
                        result.status === "error" && "border-red-500/30"
                      )}
                      data-testid={`card-test-result-${result.nodeId}`}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium" data-testid={`text-step-number-${index + 1}`}>
                        {index + 1}
                      </div>
                      {resultIcons[result.status]}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" data-testid={`text-result-node-name-${result.nodeId}`}>{node.name}</div>
                        {result.error && (
                          <div className="text-xs text-red-500 truncate" data-testid={`text-result-error-${result.nodeId}`}>
                            {result.error}
                          </div>
                        )}
                      </div>
                      {result.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-result-duration-${result.nodeId}`}>
                          <Clock className="w-3 h-3" />
                          {result.duration}ms
                        </div>
                      )}
                      {result.output && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="input" className="flex-1 p-4 m-0">
          <div className="h-full flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Sample Input Data (JSON)
            </label>
            <Textarea
              placeholder='{"key": "value"}'
              className="flex-1 font-mono text-xs resize-none"
              defaultValue='{\n  "event": "sample",\n  "data": {\n    "message": "Hello world"\n  }\n}'
              data-testid="textarea-test-input"
            />
          </div>
        </TabsContent>

        <TabsContent value="output" className="flex-1 p-4 m-0">
          <ScrollArea className="h-full">
            {testRun?.status === "completed" || testRun?.status === "failed" ? (
              <div className="space-y-4">
                {testRun.results
                  .filter((r) => r.output || r.error)
                  .map((result) => {
                    const node = workflow.nodes.find((n) => n.id === result.nodeId);
                    return (
                      <div key={result.nodeId} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          {resultIcons[result.status]}
                          <span data-testid={`text-output-node-name-${result.nodeId}`}>{node?.name}</span>
                        </div>
                        <pre className="p-3 rounded-md bg-muted/50 text-xs font-mono overflow-x-auto" data-testid={`text-output-data-${result.nodeId}`}>
                          {result.error || JSON.stringify(result.output, null, 2)}
                        </pre>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground" data-testid="text-no-output">
                Run a test to see output
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
