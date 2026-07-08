# HortusFox MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) **stdio** server for
[HortusFox](https://github.com/danielbrendel/hortusfox-web), the self-hosted plant
management system. It exposes the complete HortusFox REST API (`/api/*`) as MCP tools so
AI assistants can read and manage your plants, locations, tasks, inventory, calendar,
chat and backups.

Written in TypeScript for Node.js, using the official
[`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk).

## Features

Every endpoint of the HortusFox `ApiController` is covered — **38 tools** across 7 domains:

| Domain | Tools |
| --- | --- |
| **Plants** (18) | get, add, update, remove, list, search; custom attributes add/edit/remove; main photo update; gallery list/add/edit/remove; log add/edit/remove/fetch |
| **Locations** (2) | list, get info |
| **Tasks** (4) | fetch, add, edit, remove |
| **Inventory** (6) | fetch, add, edit, increment, decrement, remove |
| **Calendar** (4) | fetch, add, edit, remove |
| **Chat** (2) | fetch, post message |
| **Backup** (2) | export, import |

## Prerequisites

- Node.js **18+** (uses the built-in `fetch`).
- A running HortusFox instance.
- A HortusFox **API key**. In HortusFox, go to **Admin → API** and create a key.

## Installation

```bash
npm install
npm run build
```

This produces the runnable server at `dist/index.js`.

## Configuration

The server is configured entirely through environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `HORTUSFOX_URL` | ✅ | Base URL of your HortusFox instance, e.g. `https://garden.example.com` |
| `HORTUSFOX_API_TOKEN` | ✅ | API key created in the HortusFox admin panel |
| `HORTUSFOX_TIMEOUT` | ❌ | Request timeout in milliseconds (default `30000`) |

See [.env.example](./.env.example).

## Usage

### Run directly

```bash
HORTUSFOX_URL=https://garden.example.com \
HORTUSFOX_API_TOKEN=your-token \
node dist/index.js
```

The server speaks MCP over **stdio**. Diagnostic messages are written to `stderr`; the
JSON-RPC protocol uses `stdout`.

### Run with npx

Once published to npm, the server can be run without a local checkout:

```bash
HORTUSFOX_URL=https://garden.example.com \
HORTUSFOX_API_TOKEN=your-token \
npx @tomfrenzel/hortusfox-mcp
```

### Register with an MCP client

Add the server to your client's MCP configuration. The recommended way is via
`npx`:

```json
{
  "mcpServers": {
    "hortusfox": {
      "command": "npx",
      "args": ["-y", "@tomfrenzel/hortusfox-mcp"],
      "env": {
        "HORTUSFOX_URL": "https://garden.example.com",
        "HORTUSFOX_API_TOKEN": "your-token"
      }
    }
  }
}
```

Alternatively, point at a local build:

```json
{
  "mcpServers": {
    "hortusfox": {
      "command": "node",
      "args": ["/absolute/path/to/hortusfox-mcp/dist/index.js"],
      "env": {
        "HORTUSFOX_URL": "https://garden.example.com",
        "HORTUSFOX_API_TOKEN": "your-token"
      }
    }
  }
}
```

If installed globally (`npm install -g .`), you can use the `hortusfox-mcp` binary
instead of `node dist/index.js`.

## Tool reference

All tools are prefixed with `hortusfox_`. Each returns the raw HortusFox JSON response
(pretty-printed). Errors (network failures, auth rejection, or API error codes) are
returned as MCP tool errors with a descriptive message.

### Plants

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_get_plant` | `plants/get` | `plant` |
| `hortusfox_add_plant` | `plants/add` | `name`, `location` |
| `hortusfox_update_plant` | `plants/update` | `plant`, `attribute`, `value` |
| `hortusfox_remove_plant` | `plants/remove` | `plant` |
| `hortusfox_list_plants` | `plants/list` | `location?`, `limit?`, `from?`, `sort?` |
| `hortusfox_search_plants` | `plants/search` | `expression`, `limit?` |
| `hortusfox_add_plant_attribute` | `plants/attributes/add` | `plant`, `label`, `datatype`, `content` |
| `hortusfox_edit_plant_attribute` | `plants/attributes/edit` | `plant`, `label`, `datatype`, `content` |
| `hortusfox_remove_plant_attribute` | `plants/attributes/remove` | `plant`, `label` |
| `hortusfox_update_plant_photo` | `plants/photo/update` | `plant`, `external?`, `photo?`, `move_to_gallery?` |
| `hortusfox_list_plant_gallery` | `plants/gallery/list` | `plant` |
| `hortusfox_add_plant_gallery_photo` | `plants/gallery/add` | `plant`, `label?`, `external?`, `photo?` |
| `hortusfox_edit_plant_gallery_photo` | `plants/gallery/edit` | `plant`, `item`, `label` |
| `hortusfox_remove_plant_gallery_photo` | `plants/gallery/remove` | `item` |
| `hortusfox_add_plant_log_entry` | `plants/log/add` | `plant`, `content` |
| `hortusfox_edit_plant_log_entry` | `plants/log/edit` | `logid`, `content` |
| `hortusfox_remove_plant_log_entry` | `plants/log/remove` | `logid` |
| `hortusfox_fetch_plant_log` | `plants/log/fetch` | `plant`, `paginate?`, `limit?` |

> **Photos:** the API-based photo tools support **external image URLs** (`external: true`
> with a `photo` URL). Direct binary file uploads are not exposed over the token API.

### Locations

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_list_locations` | `locations/list` | `only_active?`, `include_plants?`, `include_info?`, `paginate?`, `limit?` |
| `hortusfox_get_location` | `locations/info` | `location`, `include_plants?` |

### Tasks

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_fetch_tasks` | `tasks/fetch` | `done?`, `limit?` |
| `hortusfox_add_task` | `tasks/add` | `title`, `description?`, `due_date?`, `recurring_time?`, `recurring_scope?`, `plant?` |
| `hortusfox_edit_task` | `tasks/edit` | `task`, `title?`, `description?`, `due_date?`, `recurring_time?`, `recurring_scope?`, `done?` |
| `hortusfox_remove_task` | `tasks/remove` | `task` |

### Inventory

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_fetch_inventory` | `inventory/fetch` | – |
| `hortusfox_add_inventory_item` | `inventory/add` | `name`, `description?`, `tags?`, `location?`, `amount?`, `group?`, `photo?` |
| `hortusfox_edit_inventory_item` | `inventory/edit` | `item`, plus any of the add fields |
| `hortusfox_increment_inventory_item` | `inventory/amount/inc` | `item` |
| `hortusfox_decrement_inventory_item` | `inventory/amount/dec` | `item` |
| `hortusfox_remove_inventory_item` | `inventory/remove` | `item` |

### Calendar

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_fetch_calendar` | `calendar/fetch` | `date_from?`, `date_till?` |
| `hortusfox_add_calendar_entry` | `calendar/add` | `name`, `date_from`, `date_till?`, `class?` |
| `hortusfox_edit_calendar_entry` | `calendar/edit` | `ident`, `name?`, `date_from`, `date_till?`, `class?` |
| `hortusfox_remove_calendar_entry` | `calendar/remove` | `ident` |

### Chat

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_fetch_chat` | `chat/fetch` | `limit?` |
| `hortusfox_add_chat_message` | `chat/message/add` | `message` |

### Backup

| Tool | Endpoint | Key arguments |
| --- | --- | --- |
| `hortusfox_export_backup` | `backup/export` | `locations?`, `plants?`, `gallery?`, `tasks?`, `inventory?`, `calendar?` |
| `hortusfox_import_backup` | `backup/import` | same category flags |

## Development

```bash
npm run dev        # tsc --watch
npm run typecheck  # type-check without emitting
npm run build      # compile to dist/
```

A [dev container](https://containers.dev) config is provided in
[`.devcontainer/`](./.devcontainer) for a ready-to-use Node.js + TypeScript
environment.

## Releasing

Releases are published to npm automatically by the
[`Release`](./.github/workflows/release.yml) GitHub Actions workflow whenever a
`v*` tag is pushed. The workflow type-checks, builds, verifies the tag matches
the `package.json` version, and publishes with
[npm provenance](https://docs.npmjs.com/generating-provenance-statements).

To cut a release:

```bash
npm version patch   # or minor / major — bumps package.json and creates a tag
git push --follow-tags
```

This requires an `NPM_TOKEN` secret to be configured in the repository settings.

## How it works

The Asatru framework behind HortusFox merges POST body, query string and JSON body into a
single request argument bag, and the API authenticates via a `token` parameter. This
server therefore sends each request as an `application/x-www-form-urlencoded` **POST**
(including the token and all parameters), which works uniformly for every route and avoids
URL-length limits for larger text fields. Requests are retried up to 3 times on transient
network/timeout failures; deterministic API and auth errors are surfaced immediately.

## License

MIT — see [LICENSE](./LICENSE).
