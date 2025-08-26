/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * MCP Tool: Commerce App Builder Extension Documentation Search
 *
 * This tool searches the Commerce App Builder Extension documentation for relevant information
 * to help coding agents (like Cursor, Copilot) make informed decisions while writing code.
 * It uses the configured document source (Cloudflare Worker) and returns the most relevant documentation.
 *
 * Use this tool when you need to:
 * - Find relevant Commerce App Builder Extension documentation for coding decisions
 * - Search through official documentation for specific implementation details
 * - Get context for writing code that follows Adobe Commerce best practices
 * - Retrieve source documentation for reference during development
 *
 * The tool automatically:
 * - Uses the configured document source (CLOUDFLARE_WORKER_URL environment variable)
 * - Respects the SEARCH_RESULTS_COUNT configuration or maxResults parameter
 * - Returns documentation with their metadata and content
 *
 * @param {Object} args - The tool arguments
 * @param {string} args.query - The search query to find relevant Commerce App Builder documentation
 * @param {number} args.maxResults - Maximum number of results to return (optional, defaults to 5)
 * @returns {Promise<Object>} Response object with search results
 */
export default async function searchCommerceAppBuilderDocs(args) {
  const { query, maxResults = 5 } = args;

  try {
    if (!query || typeof query !== "string") {
      throw new Error("Query must be a non-empty string");
    }

    console.error(
      `🔍 Searching Commerce App Builder Extension documentation for: "${query}"`
    );

    // Get the Cloudflare Worker URL from environment or use default
    const workerUrl =
      process.env.CLOUDFLARE_WORKER_URL ||
      "https://commerce-documentation-rag-service.apimesh-adobe-test.workers.dev";

    // Make the request to the Cloudflare Worker
    const response = await fetch(`${workerUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        query: query, 
        count: maxResults 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await response.json(); // payload will be in the format of the sample.json file
    const results = payload.results; 

    console.error(`✅ Found ${results.length} relevant documentation sections`);

    // Format the results for better readability
    const formattedResults = results.map((doc, index) => ({
      rank: index + 1,
      source: doc.metadata?.source || "Unknown",
      content: doc.pageContent,
      metadata: doc.metadata,
      relevanceScore: doc.relevanceScore,
    }));

    const result = {
      success: true,
      query: query,
      resultsCount: results.length,
      documents: formattedResults,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(
      "❌ Error searching Commerce App Builder Extension documentation:",
      error.message
    );
    
    const errorResult = {
      success: false,
      error: error.message,
      query: query,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(errorResult, null, 2),
        },
      ],
    };
  }
}
