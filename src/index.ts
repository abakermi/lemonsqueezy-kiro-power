#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";

const API_URL = "https://api.lemonsqueezy.com/v1";
const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

if (!API_KEY) {
  console.error("Error: LEMONSQUEEZY_API_KEY environment variable is required");
  process.exit(1);
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  },
});

const server = new Server(
  {
    name: "lemonsqueezy-power",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_stores",
        description: "List all stores associated with the account",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_products",
        description: "List products in a store",
        inputSchema: {
          type: "object",
          properties: {
            store_id: { type: "string", description: "Filter by store ID (optional)" },
          },
        },
      },
      {
        name: "get_product",
        description: "Get details of a specific product",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "Product ID" },
          },
          required: ["id"],
        },
      },
      {
        name: "create_product",
        description: "Create a new product (Mock/Placeholder as API is read-heavy)",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string" },
                store_id: { type: "string" },
                price: { type: "number" }
            },
            required: ["name", "store_id", "price"]
        }
      }
    ],
  };
});

// Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_stores": {
        const response = await client.get("/stores");
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case "list_products": {
        let url = "/products";
        if (args?.store_id) {
          url += `?filter[store_id]=${args.store_id}`;
        }
        const response = await client.get(url);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
        };
      }

      case "get_product": {
        const id = String(args?.id);
        const response = await client.get(`/products/${id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
        };
      }
      
      case "create_product": {
          // Lemon Squeezy API currently focuses on reading/managing, creation is often via UI or complex.
          // This is a placeholder to show intent.
          return {
              content: [{ type: "text", text: "Product creation via API requires complex relationship mapping. Use the Dashboard for now." }]
          }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.response?.data?.errors?.[0]?.detail || error.message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
