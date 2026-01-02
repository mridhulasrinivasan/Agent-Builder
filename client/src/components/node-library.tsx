import { useState } from "react";
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
  Search,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { nodeTemplates, type NodeTemplate, type NodeCategory } from "@shared/schema";

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

const categoryLabels: Record<NodeCategory, string> = {
  triggers: "Triggers",
  integrations: "Integrations",
  data: "Data",
  logic: "Logic",
  ai: "AI / ML",
  output: "Output",
};

const categoryOrder: NodeCategory[] = [
  "triggers",
  "integrations",
  "data",
  "logic",
  "ai",
  "output",
];

interface NodeLibraryProps {
  onDragStart: (template: NodeTemplate) => void;
}

export function NodeLibrary({ onDragStart }: NodeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<NodeCategory>>(
    new Set(categoryOrder)
  );

  const filteredTemplates = nodeTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTemplates = categoryOrder.reduce(
    (acc, category) => {
      acc[category] = filteredTemplates.filter((t) => t.category === category);
      return acc;
    },
    {} as Record<NodeCategory, NodeTemplate[]>
  );

  const toggleCategory = (category: NodeCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground mb-3" data-testid="text-node-library-title">
          Node Library
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-sidebar text-sm"
            data-testid="input-search-nodes"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {categoryOrder.map((category) => {
            const templates = groupedTemplates[category];
            if (templates.length === 0) return null;

            return (
              <Collapsible
                key={category}
                open={openCategories.has(category)}
                onOpenChange={() => toggleCategory(category)}
                className="mb-1"
              >
                <CollapsibleTrigger 
                  className="flex items-center gap-2 w-full px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide hover-elevate active-elevate-2 rounded-md"
                  data-testid={`button-toggle-category-${category}`}
                >
                  {openCategories.has(category) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {categoryLabels[category]}
                  <span className="ml-auto text-xs opacity-60">
                    {templates.length}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 mt-1">
                    {templates.map((template) => {
                      const Icon = iconMap[template.icon] || Webhook;
                      return (
                        <div
                          key={`${template.category}-${template.name}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "application/json",
                              JSON.stringify(template)
                            );
                            onDragStart(template);
                          }}
                          className="flex items-center gap-3 px-2 py-2 rounded-md cursor-grab hover-elevate active-elevate-2 group"
                          data-testid={`node-template-${template.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center ${
                              template.type === "trigger"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : template.type === "logic"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  : template.type === "end"
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {template.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {template.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground text-center" data-testid="text-drag-hint">
          Drag nodes to the canvas
        </div>
      </div>
    </div>
  );
}
