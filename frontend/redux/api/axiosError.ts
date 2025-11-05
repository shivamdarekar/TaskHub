import { AxiosError } from "axios";

const handleAxiosError = (error: unknown, defaultMessage: string): string => {
  // If it's an Axios error
  if (error instanceof AxiosError) {
    return error.response?.data?.message || defaultMessage;
  }
  // If it's any other error with a message property
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  // Default fallback
  return defaultMessage;
};

export { handleAxiosError };