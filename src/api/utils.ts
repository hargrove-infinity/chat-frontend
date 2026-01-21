import axios, { AxiosError } from "axios";
import type { ApiError } from "./types";

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function isApiError(error: AxiosError): error is ApiError {
  return !!(
    error.response?.data &&
    typeof error.response.data === "object" &&
    "errors" in error.response.data &&
    Array.isArray(error.response.data.errors) &&
    error.response.data.errors.every((itm) => typeof itm === "string")
  );
}
