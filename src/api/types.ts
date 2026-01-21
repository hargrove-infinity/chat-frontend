import type { AxiosPromise, AxiosError, AxiosResponse } from "axios";

// Axios
interface ApiResponsePayload<T> {
  payload: T;
}

export type ApiPromise<T> = AxiosPromise<ApiResponsePayload<T>>;

export interface ApiErrorPayload {
  errors: string[];
}

export type ApiError = AxiosError<ApiErrorPayload> & {
  response: AxiosResponse<ApiErrorPayload>;
};

// Auth
export interface AuthCredentials {
  email: string;
  password: string;
}
