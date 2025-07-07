"use server";

import prisma from "@/lib/prisma";

export const getQuestions = async () => {
  const questions = await prisma.question.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return questions;
};
