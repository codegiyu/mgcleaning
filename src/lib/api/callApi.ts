import "client-only";

import axios, { type AxiosRequestConfig } from "axios";
import type { ApiErrorResponse, ApiSuccessEnvelope, CallApiResponse } from "./http";
import { ENDPOINTS, type CallApiOptions, type EndpointName } from "./endpoints";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
});

async function executeApiRequest<T extends EndpointName>(
  endpoint: T,
  options: CallApiOptions<T>,
): Promise<ApiSuccessEnvelope<T>> {
  const { path, method } = ENDPOINTS[endpoint];
  const resolvedPath = path.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (segment, name: string) => {
    const value = options.pathParams?.[name];
    if (!value) throw new Error(`Missing API path parameter: ${name}`);
    return encodeURIComponent(value);
  });
  const requestConfig: AxiosRequestConfig = {
    url: resolvedPath,
    method,
    params: options.params,
    headers: options.headers,
    signal: options.signal,
  };

  if ("payload" in options) {
    requestConfig.data = options.payload;
  }

  const response = await api.request<ApiSuccessEnvelope<T>>(requestConfig);
  return response.data;
}

/**
 * Browser-only, typed API entry point. Keep route metadata and response types in
 * `endpoints.ts`; feature stores/components own any client-side cache policy.
 */
export async function callApi<T extends EndpointName>(
  endpoint: T,
  options: CallApiOptions<T> = {} as CallApiOptions<T>,
): Promise<CallApiResponse<T>> {
  try {
    const response = await executeApiRequest(endpoint, options);

    return {
      type: "success",
      data: response.data,
      message: response.message,
    };
  } catch (cause) {
    const responseBody = axios.isAxiosError<ApiErrorResponse>(cause)
      ? cause.response?.data
      : undefined;
    const message =
      responseBody?.message ??
      (cause instanceof Error ? cause.message : "An unexpected API error occurred.");
    const error: ApiErrorResponse = responseBody ?? {
      success: false,
      message,
      responseCode: axios.isAxiosError(cause) ? (cause.response?.status ?? 0) : 0,
    };

    return { type: "error", message: error.message, error };
  }
}

export default api;
