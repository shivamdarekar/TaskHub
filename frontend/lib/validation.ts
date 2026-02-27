// Shared validation utilities
import { PASSWORD_MIN_LENGTH, OTP_LENGTH, NAME_MIN_LENGTH, NAME_MAX_LENGTH } from "./constants";

export const validatePassword = (password: string, fieldName = "Password"): string => {
  if (!password) return `${fieldName} is required`;
  if (password.length < PASSWORD_MIN_LENGTH) return `${fieldName} must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (!/[A-Z]/.test(password)) return `${fieldName} must contain an uppercase letter`;
  if (!/[a-z]/.test(password)) return `${fieldName} must contain a lowercase letter`;
  if (!/[0-9]/.test(password)) return `${fieldName} must contain a number`;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return `${fieldName} must contain a special character`;
  return "";
};

export const validateEmail = (email: string): string => {
  if (!email) return "Email is required";
  if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
  return "";
};

export const validateOTP = (otp: string, length = OTP_LENGTH): string => {
  if (!otp) return "OTP is required";
  if (otp.length !== length) return `OTP must be ${length} digits`;
  if (!/^\d+$/.test(otp)) return "OTP must contain only numbers";
  return "";
};

export const validateName = (name: string): string => {
  if (!name) return "Name is required";
  if (name.length < NAME_MIN_LENGTH) return `Name must be at least ${NAME_MIN_LENGTH} characters`;
  if (name.length > NAME_MAX_LENGTH) return `Name must be less than ${NAME_MAX_LENGTH} characters`;
  return "";
};
