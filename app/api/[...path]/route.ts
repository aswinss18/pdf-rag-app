import { NextRequest } from "next/server";

function normalizeBackendBaseUrl(value?: string) {
  const normalized = value?.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  return normalized || "https://pdf-rag-backend-production-67bf.up.railway.app";
}

function buildBackendUrl(path: string[]) {
  const baseUrl = normalizeBackendBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  const pathname = path.join("/");
  return `${baseUrl}/${pathname}`;
}

async function forward(request: NextRequest, path: string[]) {
  const targetUrl = new URL(buildBackendUrl(path));
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, init);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(request, path);
}
