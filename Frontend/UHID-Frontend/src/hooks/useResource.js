import { useQuery, useQueryClient } from "@tanstack/react-query";

const useResource = (fetchFunction, key, params = null) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [key, params], 
    queryFn: () => fetchFunction(params),
    
    // 🔥 INDUSTRY LEVEL POLLING LOGIC
    staleTime: 0,              // Data ko hamesha stale maano taaki refetch trigger ho sake
    refetchInterval: 5000,     // Har 5 second mein auto-check karega (Polling)
    refetchOnWindowFocus: true,// Jaise hi doctor tab par wapas aaye, refresh ho jaye
    refetchOnReconnect: true,  // Internet wapas aane par sync karega
  });

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return { data, loading: isLoading, error, reload };
};

export default useResource;