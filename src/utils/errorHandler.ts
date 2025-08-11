export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class AppError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred',
  };
};

export const showErrorToast = (error: ApiError) => {
  // You can integrate with a toast library here
  console.error('Error:', error);
  alert(error.message);
};

export const showSuccessToast = (message: string) => {
  // You can integrate with a toast library here
  console.log('Success:', message);
  alert(message);
};
