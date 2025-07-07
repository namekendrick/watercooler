import { useQuery } from "@tanstack/react-query";

import { getQuestions } from "@/db/question";

export const useGetQuestions = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => {
      return getQuestions();
    },
  });

  return { data, isLoading };
};
