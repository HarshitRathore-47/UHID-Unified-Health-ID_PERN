import { useQuery, useQueryClient } from "@tanstack/react-query";

const usePaginatedResource = (fetchFunction, key, initialPage = 1) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
  queryKey: [key, initialPage],
  queryFn: () => fetchFunction(typeof initialPage === "number" ? { page: initialPage } : initialPage),
  
  refetchInterval: 10000, // Lists ko har 10 second mein check karein
  keepPreviousData: true,
});

  const load = () => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return { 
    records: data?.record || [], 
    pagination: data?.pagination || null, 
    loading: isLoading, 
    error, 
    load 
  };
};

export default usePaginatedResource;