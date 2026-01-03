# AgentFlow - AI Agent Workflow Builder

A visual drag-and-drop workflow builder for creating AI agent automations, similar to Zapier.

## Features

- **Visual Canvas** - Drag-and-drop interface with pan, zoom, and grid
- **15+ Node Templates** - Triggers, integrations, data transforms, logic, AI, and outputs
- **Node Connections** - Visual bezier curve connections between nodes
- **Configuration Panel** - Dynamic forms for node settings
- **Workflow Testing** - Simulated execution with step-by-step results
- **Dark Mode** - Full dark/light theme support

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **State**: TanStack Query, React Context
- **Validation**: Zod, drizzle-zod

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agentflow.git
cd agentflow

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Deploy on Replit

1. Fork this repository
2. Go to [Replit](https://replit.com)
3. Click "Create Repl" -> "Import from GitHub"
4. Paste your repository URL
5. Click "Import from GitHub"
6. The app will automatically start

## Project Structure

```
├── client/src/
│   ├── components/     # UI components
│   ├── lib/            # Context & utilities
│   └── pages/          # Page components
├── server/
│   ├── routes.ts       # API endpoints
│   └── storage.ts      # Data storage
└── shared/
    └── schema.ts       # Type definitions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workflows | List all workflows |
| POST | /api/workflows | Create workflow |
| PATCH | /api/workflows/:id | Update workflow |
| DELETE | /api/workflows/:id | Delete workflow |

## License

MIT
