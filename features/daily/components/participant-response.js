"use client";

import { Shuffle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDailyQuestionState } from "@/features/daily/hooks/use-daily-question-state";
import { useDynamicFontSize } from "@/features/daily/hooks/use-dynamic-font-size";
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
    getViewedParticipantIds,
  } = useDailyQuestionState();

  const participant = room?.participants?.find(
    (p) => p.id === viewingParticipantId
  );

  const roomQuestion =
    participant?.response?.question ||
    room?.participants?.find((p) => p.response?.question)?.response?.question;
  const question = roomQuestion || currentQuestion;

  const isHistoricalRoom =
    roomQuestion && currentQuestion && roomQuestion.id !== currentQuestion.id;

  const { displayedText, isTyping } = useTypewriter(
    participant?.response?.text
  );

  const { fontSizeClasses, minHeightClass } = useDynamicFontSize(displayedText);

  const handleNextResponse = () => {
    if (!room?.participants || !hasHydrated || !room?.code || !participant?.id)
      return;

    const nextParticipant = getNextRandomParticipant(
      room.participants,
      room.code,
      participant.id
    );

    if (nextParticipant) {
      setViewingParticipantId(nextParticipant.id);

      markParticipantAsViewed(nextParticipant.id, room.code);

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

  const participantsWithResponses = getParticipantsWithResponses(
    room?.participants || []
  );
  const hasMultipleResponses = participantsWithResponses.length > 1;

  const viewedIds = room?.code ? getViewedParticipantIds(room.code) : [];
  const hasShuffleStarted = viewedIds.length > 0;

  if (!question) return null;

  if (participantsWithResponses.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-8">
        <p className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl text-center mb-8">
          {question.text}
        </p>
        <div className="text-3xl md:text-4xl font-black text-gray-400 tracking-tight leading-none text-center max-w-4xl">
          No responses yet
        </div>
        {isHistoricalRoom && (
          <Button
            variant="outline"
            className="mt-8 mb-4"
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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-8">
      <p className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl text-center mb-8">
        {question.text}
      </p>
      <div
        className={`${fontSizeClasses} font-black text-gray-900 tracking-tight leading-tight text-center max-w-4xl ${minHeightClass} flex items-center justify-center px-4`}
      >
        <span>{displayedText}</span>
      </div>
      {(hasMultipleResponses || isHistoricalRoom) && (
        <Button
          disabled={isTyping || !hasHydrated}
          variant="outline"
          className="mt-8 mb-4"
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
