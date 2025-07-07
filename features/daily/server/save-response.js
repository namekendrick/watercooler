"use server";

import prisma from "@/lib/prisma";
import { saveResponseSchema } from "@/features/daily/schemas";

export const saveResponse = async (values) => {
  const { text, participantId, questionId } = values;

  const validatedFields = saveResponseSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!" };

  try {
    const participant = await prisma.participant.findUnique({
      where: {
        id: participantId,
      },
    });

    if (!participant) {
      return { status: 404, message: "Participant not found" };
    }

    // Use upsert to either update existing response or create new one
    const response = await prisma.response.upsert({
      where: {
        participantId: participantId,
      },
      update: {
        text,
        questionId,
      },
      create: {
        text,
        room: {
          connect: {
            id: participant.roomId,
          },
        },
        participant: {
          connect: {
            id: participantId,
          },
        },
        question: {
          connect: {
            id: questionId,
          },
        },
      },
    });

    return {
      status: 201,
      message: "Response saved successfully",
      data: {
        response,
      },
    };
  } catch (error) {
    console.error("Error saving response:", error);
    return { status: 500, message: "Failed to save response" };
  }
};
