import { useQuery, useQueryClient } from "@tanstack/react-query";

// src/hooks/useResource.js
const useResource = (fetchFunction, key, params = null, options = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [key, params],
    queryFn: () => fetchFunction(params),
    staleTime: 30000,
    // Agar options.enabled false hai toh interval bhi rok do (Editing ke waqt)
    refetchInterval: options.enabled === false ? false : 10000,
    refetchOnWindowFocus: true,
    ...options,
  });

  // ✅ Naya Function: Sirf Cache badalne ke liye
  const updateCache = (newData) => {
    queryClient.setQueryData([key, params], (oldData) => {
      if (!oldData) return newData;
      return { ...oldData, ...newData }; // Sirf nayi fields merge hongi
    });
  };

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return { ...query, loading: query.isLoading, reload, updateCache };
};

export default useResource;