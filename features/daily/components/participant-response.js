"use client";

import { Shuffle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCreateRoom } from "@/features/daily/api/use-create-room";
import { useDailyQuestionState } from "@/features/daily/hooks/use-daily-question-state";
import { useDynamicFontSize } from "@/features/daily/hooks/use-dynamic-font-size";
import { useTypewriter } from "@/features/daily/hooks/use-typewriter";
import { useUnscrambleText } from "@/features/daily/hooks/use-unscramble-text";
import { useDailyQuestion } from "@/features/daily/providers/daily-question-provider";

export const ParticipantResponse = ({ room }) => {
  const { currentQuestion } = useDailyQuestion();
  const { mutate: createRoom, isPending: isCreatingRoom } = useCreateRoom();

  const {
    viewingParticipantId,
    setViewingParticipantId,
    hasHydrated,
    getNextRandomParticipant,
    markParticipantAsViewed,
    getParticipantsWithResponses,
    getViewedParticipantIds,
    getCurrentParticipantId,
  } = useDailyQuestionState();

  const {
    displayText: unscrambleText,
    isUnscrambling,
    isFinished: isUnscrambleFinished,
    startUnscramble,
  } = useUnscrambleText();

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
        toast.success("You've seen all the responses!");
      }
    }
  };

  const handleCreateNewRoom = () => {
    const currentParticipantId = getCurrentParticipantId(room?.code);
    const currentParticipant = room?.participants?.find(
      (p) => p.id === currentParticipantId
    );

    createRoom({ name: currentParticipant?.name || null });
  };

  const handleRevealPerson = () => {
    if (!participant?.name) return;
    startUnscramble(participant.name);
  };

  const participantsWithResponses = getParticipantsWithResponses(
    room?.participants || []
  );
  const hasMultipleResponses = participantsWithResponses.length > 1;

  const viewedIds = room?.code ? getViewedParticipantIds(room.code) : [];
  const hasShuffleStarted = viewedIds.length > 0;

  if (!question) return null;

  if (!participant || !participant.response?.text) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-8">
      <p className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl text-center mb-8">
        {question.text}
      </p>
      <div
        className={`${fontSizeClasses} font-black text-gray-900 tracking-tight leading-tight text-center max-w-4xl ${minHeightClass} flex items-center justify-center px-4`}
      >
        <span className={isUnscrambleFinished ? "rainbow-text" : ""}>
          {unscrambleText || displayedText}
        </span>
      </div>
      {(hasMultipleResponses || isHistoricalRoom) && (
        <div className="flex flex-col min-w-md gap-3 mt-8 mb-4">
          {!isHistoricalRoom && hasShuffleStarted && (
            <Button
              disabled={isTyping || !hasHydrated || isUnscrambling}
              onClick={handleRevealPerson}
            >
              Reveal Person
            </Button>
          )}

          {isHistoricalRoom ? (
            <Button
              disabled={isCreatingRoom}
              variant="outline"
              onClick={handleCreateNewRoom}
            >
              {isCreatingRoom ? "Creating room..." : "Answer today's question"}
            </Button>
          ) : (
            <Button
              disabled={isTyping || !hasHydrated || isUnscrambling}
              variant="outline"
              onClick={handleNextResponse}
            >
              {hasShuffleStarted ? (
                <>
                  Next Response
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Start Shuffle
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
