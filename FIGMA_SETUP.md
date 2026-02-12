# Using the Figma API to Drive Implementation

You can pull design data from your Figma file using a **Personal Access Token** so the codebase can be aligned with the Ball4 Foundation Figma design without using the Figma desktop MCP.

## 1. Create a Figma Personal Access Token

1. In Figma, go to **Settings** (click your avatar → Settings).
2. Open **Personal access tokens** (or [figma.com/settings](https://www.figma.com/settings) → Personal access tokens).
3. Click **Generate new token**.
4. Give it a name (e.g. “Ball4 dev”) and ensure the **file_content:read** scope is enabled.
5. Copy the token and store it somewhere safe (Figma only shows it once).

## 2. Add the Token to Your Environment

Add this to your `.env` file in the project root (do **not** commit this file):

```bash
FIGMA_ACCESS_TOKEN=your-figma-token-here
```

Your `.env` is already in `.gitignore`, so the token will stay local.

## 3. Fetch the Design File

From the project root, run:

```bash
node scripts/figma-fetch.js
```

This calls the Figma REST API, downloads the file for [Ball4 Foundation Website](https://www.figma.com/design/v963LpQMaglrkwS9SG668x/Ball4-Foundation-Website), and writes it to `figma-design.json` in the project root. That file is gitignored.

## 4. Use the Design in Implementation

After `figma-design.json` exists, you can ask the assistant to:

- Implement or update pages/sections based on the design file.
- Match typography, colors, spacing, and layout to the Figma structure.

The assistant will read `figma-design.json` (and optionally specific node IDs from your Figma URL, e.g. `node-id=1-944`) to align the site with the design.

## Security

- **Do not** put `FIGMA_ACCESS_TOKEN` in the chat or commit it.
- Keep it only in `.env` (or your local environment).
- Regenerate or revoke the token in Figma if it’s ever exposed.

## Reference

- [Figma REST API – Authentication](https://developers.figma.com/docs/rest-api/authentication/)
- [Figma REST API – GET file](https://developers.figma.com/docs/rest-api/file-endpoints/#get-file)
