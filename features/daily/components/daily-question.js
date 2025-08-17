"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useSaveResponse } from "@/features/daily/api/use-save-response";
import { AddParticipantForm } from "@/features/daily/components/add-participant-form";
import { useDailyQuestionState } from "@/features/daily/hooks/use-daily-question-state";
import { useDailyQuestion } from "@/features/daily/providers/daily-question-provider";
import { saveResponseSchema } from "@/features/daily/schemas";

export const DailyQuestion = ({ room }) => {
  const { currentQuestion } = useDailyQuestion();
  const { getCurrentParticipantId, isParticipantInRoom, hasHydrated } =
    useDailyQuestionState();
  const { mutate: saveResponseMutation } = useSaveResponse();
  const [isEditing, setIsEditing] = useState(false);

  const currentParticipantId = getCurrentParticipantId(room?.code);
  const isUserInRoom = hasHydrated ? isParticipantInRoom(room?.code) : false;
  const currentParticipant = room?.participants?.find(
    (participant) => participant.id === currentParticipantId
  );
  const existingResponse = currentParticipant?.response;

  const roomQuestion =
    existingResponse?.question ||
    room?.participants?.find((p) => p.response?.question)?.response?.question;

  const question = roomQuestion || currentQuestion;

  const isHistoricalRoom =
    roomQuestion && currentQuestion && roomQuestion.id !== currentQuestion.id;

  const form = useForm({
    resolver: zodResolver(saveResponseSchema),
    defaultValues: {
      text: "",
    },
  });

  useEffect(() => {
    if (existingResponse?.text) {
      form.reset({ text: existingResponse.text });
    }
  }, [existingResponse?.text, form]);

  const saveResponse = (values) => {
    const participantId = getCurrentParticipantId(room?.code);

    saveResponseMutation(
      {
        text: values.text,
        participantId,
        questionId: question.id,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleEditClick = () => setIsEditing(true);

  if (!question) return null;

  if (!isUserInRoom && !isHistoricalRoom && hasHydrated && currentQuestion)
    return <AddParticipantForm room={room} />;

  const isFormDisabled =
    !currentParticipantId || (existingResponse && !isEditing);
  const showEditIcon = existingResponse && !isEditing;
  const showSendIcon = !existingResponse || isEditing;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-16">
      <h1
        key={question.id}
        className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none text-center max-w-4xl min-h-[200px] flex items-center justify-center animate-in fade-in-0 slide-in-from-bottom-8 duration-500"
      >
        <span>{question.text}</span>
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(saveResponse)}
          className="relative max-w-3xl w-full"
        >
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share your thoughts..."
                    disabled={isFormDisabled}
                    className={`resize-none shadow-md border-none pr-14 min-w-full ${
                      isFormDisabled
                        ? "bg-gray-50 text-gray-700 cursor-not-allowed"
                        : ""
                    }`}
                    rows={4}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {showEditIcon && (
            <Button
              type="button"
              onClick={handleEditClick}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit size={20} />
            </Button>
          )}
          {showSendIcon && (
            <Button
              type="submit"
              disabled={isFormDisabled}
              className="absolute bottom-3 right-3 p-2 bg-emerald-600"
            >
              <Send size={20} />
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};
