"use server";

import prisma from "@/lib/prisma";
import { generateRoomCode } from "@/lib/utils";

export const createRoom = async (values) => {
  const { name } = values;

  try {
    let roomCode;
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate a unique room code
    while (!isCodeUnique && attempts < maxAttempts) {
      roomCode = generateRoomCode();

      const existingRoom = await prisma.room.findUnique({
        where: { code: roomCode },
      });

      if (!existingRoom) isCodeUnique = true;

      attempts++;
    }

    if (!isCodeUnique) {
      throw new Error(
        "Failed to generate unique room code after multiple attempts"
      );
    }

    const room = await prisma.room.create({
      data: {
        code: roomCode,
        participants: {
          create: {
            name,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Get the created participant (should be the first and only one)
    const createdParticipant = room.participants[0];

    return {
      status: 201,
      message: "Room created successfully",
      data: {
        room,
        participant: createdParticipant,
      },
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return { status: 500, message: "Failed to create room" };
  }
};
