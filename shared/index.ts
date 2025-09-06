// Shared Module - Hauptexport für alle gemeinsamen Utilities
// Wird von Frontend und Backend verwendet

// Types
export * from './types';

// Contracts
export * from './contracts/error';
export * from './contracts/validation';

// Utilities
export * from './utils';

// Re-export commonly used items for convenience
export { 
  ERROR_CODES, 
  HTTP_STATUS, 
  ApiErrorFactory, 
  ApiResponseFactory,
  type ApiError,
  type ApiResponse,
  type PaginationMeta
} from './contracts/error';

export {
  validateInput,
  validateQuery,
  type CreateUserInput,
  type UpdateUserInput,
  type LoginInput,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateTaskInput,
  type UpdateTaskInput,
  type CreateTeamInput,
  type UpdateTeamInput,
  type TaskQueryInput,
  type ProjectQueryInput,
  type DeadlineQueryInput
} from './contracts/validation';

export {
  utils,
  dateUtils,
  stringUtils,
  arrayUtils,
  objectUtils,
  numberUtils,
  colorUtils,
  validationUtils,
  envUtils
} from './utils';
