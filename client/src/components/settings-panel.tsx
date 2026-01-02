import { X, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useWorkflow } from "@/lib/workflow-context";

export function SettingsPanel() {
  const { workflow, selectedNodeId, selectNode, updateNode, deleteNode } = useWorkflow();

  const selectedNode = workflow?.nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-96 border-l bg-card flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold" data-testid="text-settings-title">Settings</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Settings className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground" data-testid="text-settings-empty">
              Select a node to configure
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleConfigChange = (key: string, value: string | number | boolean) => {
    updateNode(selectedNode.id, {
      config: { ...selectedNode.config, [key]: value },
    });
  };

  const renderConfigField = (key: string, value: string | number | boolean | string[]) => {
    const fieldId = `config-${key}`;

    if (key === "method") {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="text-xs font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </Label>
          <Select
            value={String(value)}
            onValueChange={(v) => handleConfigChange(key, v)}
          >
            <SelectTrigger id={fieldId} data-testid={`select-config-${key}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (key === "model") {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="text-xs font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </Label>
          <Select
            value={String(value)}
            onValueChange={(v) => handleConfigChange(key, v)}
          >
            <SelectTrigger id={fieldId} data-testid={`select-config-${key}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (
      key === "body" ||
      key === "headers" ||
      key === "code" ||
      key === "prompt" ||
      key === "message"
    ) {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="text-xs font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </Label>
          <Textarea
            id={fieldId}
            value={String(value)}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="font-mono text-xs min-h-[80px] resize-none"
            placeholder={`Enter ${key}...`}
            data-testid={`textarea-config-${key}`}
          />
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="text-xs font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </Label>
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(key, parseInt(e.target.value) || 0)}
            data-testid={`input-config-${key}`}
          />
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={fieldId} className="text-xs font-medium capitalize">
          {key.replace(/([A-Z])/g, " $1").trim()}
        </Label>
        <Input
          id={fieldId}
          value={String(value)}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          placeholder={`Enter ${key}...`}
          data-testid={`input-config-${key}`}
        />
      </div>
    );
  };

  return (
    <div className="w-96 border-l bg-card flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
              selectedNode.type === "trigger"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : selectedNode.type === "logic"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : selectedNode.type === "end"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}
          >
            <Settings className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate" data-testid="text-selected-node-name">{selectedNode.name}</h2>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-selected-node-type">
              {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} node
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => selectNode(null)}
          data-testid="button-close-settings"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-name" className="text-xs font-medium">
                Node Name
              </Label>
              <Input
                id="node-name"
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                data-testid="input-node-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-description" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="node-description"
                value={selectedNode.description}
                onChange={(e) =>
                  updateNode(selectedNode.id, { description: e.target.value })
                }
                className="resize-none min-h-[60px]"
                data-testid="textarea-node-description"
              />
            </div>
          </div>

          <Separator />

          <Accordion type="single" collapsible defaultValue="configuration">
            <AccordionItem value="configuration" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline" data-testid="accordion-configuration">
                Configuration
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {Object.entries(selectedNode.config).map(([key, value]) =>
                    renderConfigField(key, value)
                  )}
                  {Object.keys(selectedNode.config).length === 0 && (
                    <p className="text-xs text-muted-foreground" data-testid="text-no-config">
                      No configuration options for this node.
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="advanced" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline" data-testid="accordion-advanced">
                Advanced Options
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Error Handling</Label>
                    <Select defaultValue="stop">
                      <SelectTrigger data-testid="select-error-handling">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stop">Stop workflow</SelectItem>
                        <SelectItem value="continue">Continue to next</SelectItem>
                        <SelectItem value="retry">Retry 3 times</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Timeout (seconds)</Label>
                    <Input
                      type="number"
                      defaultValue={30}
                      min={1}
                      max={300}
                      data-testid="input-timeout"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => deleteNode(selectedNode.id)}
          data-testid="button-delete-node"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
