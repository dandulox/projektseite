// Mock für @tanstack/react-query
export const useQuery = jest.fn();
export const useMutation = jest.fn();
export const useQueryClient = jest.fn();
export const QueryClient = jest.fn();
export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => children;
export const useInfiniteQuery = jest.fn();
export const useIsFetching = jest.fn();
export const useIsMutating = jest.fn();
