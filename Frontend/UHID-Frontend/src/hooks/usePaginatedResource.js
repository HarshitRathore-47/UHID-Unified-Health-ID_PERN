import { useQuery, useQueryClient ,keepPreviousData} from "@tanstack/react-query";

const usePaginatedResource = (fetchFunction, key, initialPage = 1, options = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error ,...rest} = useQuery({
    queryKey: [key, initialPage],
    queryFn: () => fetchFunction(typeof initialPage === "number" ? { page: initialPage } : initialPage),

    refetchInterval: options.poll ? 15000 : false,
    placeholderData: keepPreviousData,
    ...options,
  });

  const load = () => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return {
    records: data?.record || [],
    pagination: data?.pagination || null,
    loading: isLoading,
    isFetching: rest.isFetching,
    error,
    load
  };
};

export default usePaginatedResource;