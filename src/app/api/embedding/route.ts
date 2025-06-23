import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_VERTEX_REGION || "us-central1";
const MODEL = "gemini-embedding-001"; // Updated to latest model

interface EmbeddingRequest {
  text: string;
  task?:
    | "RETRIEVAL_QUERY"
    | "RETRIEVAL_DOCUMENT"
    | "SEMANTIC_SIMILARITY"
    | "CLASSIFICATION"
    | "CLUSTERING";
}

interface EmbeddingResponse {
  embedding: number[];
  error?: string;
  details?: string;
}

// 🚀 Production-ready Google Auth initialization
function initializeGoogleAuth() {
  // Option 1: Use service account key from environment variable (Production)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccountKey = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      );
      return new GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
    } catch (error) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:", error);
    }
  }

  // Option 2: Use service account key file (Development)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }

  // Option 3: Use default credentials (Cloud Run, GCE, etc.)
  return new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<EmbeddingResponse>> {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { embedding: [], error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: EmbeddingRequest = await req.json();
    const { text, task = "SEMANTIC_SIMILARITY" } = body;

    if (!text) {
      return NextResponse.json(
        { embedding: [], error: "No text provided" },
        { status: 400 }
      );
    }

    if (!PROJECT_ID) {
      return NextResponse.json(
        { embedding: [], error: "Google Project ID not configured" },
        { status: 500 }
      );
    }

    // Initialize Google Auth with production-ready method
    const auth = initializeGoogleAuth();
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to get access token");
    }

    // Vertex AI Embedding API endpoint
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

    // Prepare the request payload
    const payload = {
      instances: [
        {
          content: text,
          task_type: task,
        },
      ],
    };

    // Make the API call
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vertex AI API Error:", response.status, errorText);
      throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract embedding from response
    const embedding =
      data.predictions?.[0]?.embeddings?.values ||
      data.predictions?.[0]?.values;

    if (!embedding || !Array.isArray(embedding)) {
      console.error("Unexpected API response structure:", data);
      throw new Error("Invalid embedding response structure");
    }

    return NextResponse.json({ embedding });
  } catch (error) {
    console.error("Embedding API error:", error);
    return NextResponse.json(
      {
        embedding: [],
        error: "Embedding generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  const authConfigured = !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  return NextResponse.json({
    message: "Embedding API is running",
    model: MODEL,
    location: LOCATION,
    projectConfigured: !!PROJECT_ID,
    authConfigured,
    authMethod: process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ? "service_account_key_env"
      : process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? "service_account_file"
      : "default_credentials",
  });
}
