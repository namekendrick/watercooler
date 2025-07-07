"use server";

import prisma from "@/lib/prisma";

export const addParticipant = async (values) => {
  const { name, roomCode } = values;

  try {
    // First create the participant and get the result
    const createdParticipant = await prisma.participant.create({
      data: {
        name,
        room: {
          connect: {
            code: roomCode,
          },
        },
      },
    });

    // Then get the updated room with all participants
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: {
        participants: true,
      },
    });

    return {
      status: 201,
      message: "Participant added successfully",
      data: {
        room,
        participant: createdParticipant,
      },
    };
  } catch (error) {
    console.error("Error adding participant:", error);
    return { status: 500, message: "Failed to add participant" };
  }
};
