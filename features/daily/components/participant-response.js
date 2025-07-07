"use client";

import { Shuffle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDailyQuestionState } from "@/features/daily/hooks/use-daily-question-state";
import { useTypewriter } from "@/features/daily/hooks/use-typewriter";
import { useDailyQuestion } from "@/features/daily/providers/daily-question-provider";

export const ParticipantResponse = ({ room }) => {
  const router = useRouter();
  const { currentQuestion } = useDailyQuestion();

  const {
    viewingParticipantId,
    setViewingParticipantId,
    hasHydrated,
    getNextRandomParticipant,
    markParticipantAsViewed,
    getParticipantsWithResponses,
    isLastUnviewedParticipant,
    getViewedParticipantIds,
  } = useDailyQuestionState();

  const participant = room?.participants?.find(
    (p) => p.id === viewingParticipantId
  );

  // Use the room's question if available (for historical rooms), otherwise use current question
  const roomQuestion =
    participant?.response?.question ||
    room?.participants?.find((p) => p.response?.question)?.response?.question;
  const question = roomQuestion || currentQuestion;

  // Determine if this is a room from a previous day
  const isHistoricalRoom =
    roomQuestion && currentQuestion && roomQuestion.id !== currentQuestion.id;

  // Auto-select a participant for initial view if none selected
  useEffect(() => {
    if (hasHydrated && !viewingParticipantId && room?.participants) {
      const participantsWithResponses = getParticipantsWithResponses(
        room.participants
      );
      if (participantsWithResponses.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * participantsWithResponses.length
        );
        setViewingParticipantId(participantsWithResponses[randomIndex].id);
      }
    }
  }, [
    hasHydrated,
    viewingParticipantId,
    room,
    getParticipantsWithResponses,
    setViewingParticipantId,
  ]);

  const { displayedText, isTyping } = useTypewriter(
    participant?.response?.text
  );

  const handleNextResponse = () => {
    if (!room?.participants || !hasHydrated || !room?.code || !participant?.id)
      return;

    // Get next random participant, excluding current participant when restarting
    const nextParticipant = getNextRandomParticipant(
      room.participants,
      room.code,
      participant.id
    );

    if (nextParticipant) {
      // Switch to viewing the next participant
      setViewingParticipantId(nextParticipant.id);

      // Mark the next participant as viewed (the one we're now viewing)
      markParticipantAsViewed(nextParticipant.id, room.code);

      // Check if we've now seen all responses by comparing viewed count to total responses
      const viewedIds = getViewedParticipantIds(room.code);
      const totalResponses = getParticipantsWithResponses(
        room.participants
      ).length;

      if (viewedIds.length === totalResponses) {
        toast.success("You've seen all responses!");
      }
    }
  };

  const handleCreateNewRoom = () => router.push("/");

  // Get participants with responses for button state
  const participantsWithResponses = getParticipantsWithResponses(
    room?.participants || []
  );
  const hasMultipleResponses = participantsWithResponses.length > 1;

  // Check if shuffle has started (any participants have been viewed)
  const viewedIds = room?.code ? getViewedParticipantIds(room.code) : [];
  const hasShuffleStarted = viewedIds.length > 0;

  if (!question) return null;

  // Show a message if there are no responses yet
  if (participantsWithResponses.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl">
          {question.text}
        </p>
        <div className="text-3xl md:text-4xl font-black text-gray-400 tracking-tight leading-none text-center max-w-4xl mt-8">
          No responses yet
        </div>
        {isHistoricalRoom && (
          <Button
            variant="outline"
            className="mt-8"
            onClick={handleCreateNewRoom}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Room
          </Button>
        )}
      </div>
    );
  }

  if (!participant || !participant.response?.text) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <p className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl">
        {question.text}
      </p>
      <div className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none text-center max-w-4xl min-h-[150px] flex items-center justify-center">
        <span>{displayedText}</span>
      </div>
      {(hasMultipleResponses || isHistoricalRoom) && (
        <Button
          disabled={isTyping || !hasHydrated}
          variant="outline"
          className="mt-16"
          onClick={isHistoricalRoom ? handleCreateNewRoom : handleNextResponse}
        >
          {isHistoricalRoom ? (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create New Room
            </>
          ) : hasShuffleStarted ? (
            "Next Response"
          ) : (
            <>
              <Shuffle className="mr-2 h-4 w-4" />
              Start Shuffle
            </>
          )}
        </Button>
      )}
    </div>
  );
};
