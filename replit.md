# AgentFlow - AI Agent Workflow Builder

## Overview
A visual workflow builder for creating AI agent automations, similar to Zapier. Users can drag-and-drop nodes onto a canvas, connect them to create workflows, configure settings, and test their agents.

## Project Architecture

### Frontend (client/src/)
- **Framework**: React with TypeScript, Vite for bundling
- **Routing**: Wouter
- **State Management**: React Context (WorkflowProvider) + TanStack Query
- **Styling**: Tailwind CSS with shadcn/ui components
- **Design**: Inter font, clean modern aesthetic with dark mode support

### Key Components
- `workflow-builder.tsx` - Main page layout
- `workflow-header.tsx` - Top bar with workflow name, save/test controls
- `node-library.tsx` - Left sidebar with draggable node templates
- `workflow-canvas.tsx` - Central canvas with pan/zoom, node rendering, connections
- `workflow-node.tsx` - Individual node component with ports
- `settings-panel.tsx` - Right panel for node configuration
- `test-panel.tsx` - Bottom panel for testing workflows
- `theme-toggle.tsx` - Dark/light mode toggle

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage class)
- **API Endpoints**:
  - `GET /api/workflows` - List all workflows
  - `GET /api/workflows/:id` - Get single workflow
  - `POST /api/workflows` - Create workflow
  - `PATCH /api/workflows/:id` - Update workflow
  - `DELETE /api/workflows/:id` - Delete workflow
  - `POST /api/workflows/:id/test` - Run workflow test
  - `GET /api/workflows/:id/tests` - Get test runs

### Data Models (shared/schema.ts)
- `Workflow` - Container for nodes and connections
- `WorkflowNode` - Individual steps (trigger, action, logic, end types)
- `Connection` - Links between nodes
- `NodeTemplate` - Templates for creating new nodes
- `TestRun` / `TestResult` - Test execution data

## Node Categories
- **Triggers**: Webhook, Schedule, Manual
- **Integrations**: HTTP Request, Slack, Email
- **Data**: Transform, Filter
- **Logic**: Condition, Loop, Delay
- **AI**: AI Prompt, AI Classify
- **Output**: Response, Save to DB

## Features
- Drag-and-drop node placement
- Visual connection drawing between nodes
- Pan and zoom canvas with grid background
- Node configuration panel
- Workflow testing with execution timeline
- Dark mode support
- Responsive design

## Development
- Run: `npm run dev`
- Server runs on port 5000
- Frontend and backend served from same port via Vite middleware

## Recent Changes
- January 2, 2026: Initial implementation of workflow builder UI with all core features
