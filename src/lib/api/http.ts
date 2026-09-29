import type { AllEndpoints, EndpointName } from "./endpoints";

export type ApiSuccessEnvelope<T extends EndpointName> = {
  success: true;
  message: string;
  responseCode: number;
  data: AllEndpoints[T]["response"];
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  responseCode: number;
  error?: unknown;
};

export type ApiError = ApiErrorResponse & {
  responseCode: number;
};

export type CallApiResponse<T extends EndpointName> =
  | { type: "success"; message: string; data: AllEndpoints[T]["response"] }
  | { type: "error"; message: string; error: ApiError };
