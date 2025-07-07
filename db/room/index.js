"use server";

import prisma from "@/lib/prisma";

export const getRoom = async (code) => {
  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      participants: {
        include: {
          response: {
            include: {
              question: true,
            },
          },
        },
      },
    },
  });

  return room;
};
