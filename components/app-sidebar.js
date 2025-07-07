"use client";

import { PlusIcon, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddParticipant } from "@/features/daily/api/use-add-participant";
import { useRemoveParticipant } from "@/features/daily/api/use-remove-participant";
import { useDailyQuestionState } from "@/features/daily/hooks/use-daily-question-state";
import { useDailyQuestion } from "@/features/daily/providers/daily-question-provider";
import { cn } from "@/lib/utils";

export const AppSidebar = ({ room }) => {
  const { mutate: addParticipant } = useAddParticipant();
  const { mutate: removeParticipant } = useRemoveParticipant();
  const { currentQuestion } = useDailyQuestion();
  const {
    isCurrentParticipant,
    isParticipantInRoom,
    hasHydrated,
    setViewingParticipantId,
  } = useDailyQuestionState();
  const [hoveredParticipantId, setHoveredParticipantId] = useState(null);
  const [name, setName] = useState("");

  const isUserInRoom = hasHydrated ? isParticipantInRoom(room.code) : false;

  // Determine if this is a room from a previous day
  const roomQuestion = room?.participants?.find((p) => p.response?.question)
    ?.response?.question;
  const isHistoricalRoom =
    roomQuestion && currentQuestion && roomQuestion.id !== currentQuestion.id;

  const handleAddParticipant = () => {
    if (isUserInRoom || isHistoricalRoom) return;

    addParticipant(
      { name, roomCode: room.code },
      { onSuccess: () => setName("") }
    );
  };

  const handleRemoveParticipant = (participantId) => {
    if (isHistoricalRoom) return;
    removeParticipant({ id: participantId, roomCode: room.code });
  };

  const handleParticipantClick = (participant) => {
    if (!participant.response?.text) return;

    setViewingParticipantId(participant.id);
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Participants
            {isHistoricalRoom && (
              <span className="ml-2 text-xs text-gray-500 font-normal">
                (Read-only)
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {!hasHydrated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 flex-1" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!isHistoricalRoom && (
                  <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    <Input
                      placeholder="Participant name"
                      className="md:text-sm bg-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isUserInRoom}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddParticipant}
                      disabled={isUserInRoom}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <SidebarMenu className="mt-6 group-data-[collapsible=icon]:mt-8">
                  {room.participants.map((participant) => {
                    const isCurrentUser = isCurrentParticipant(
                      participant.id,
                      room.code
                    );

                    return (
                      <SidebarMenuItem key={participant.id} className="h-full">
                        <SidebarMenuButton
                          className={cn(
                            "min-h-12 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:justify-center",
                            participant.response &&
                              "cursor-pointer hover:bg-gray-100"
                          )}
                          tooltip={participant.name}
                          onMouseEnter={() =>
                            setHoveredParticipantId(participant.id)
                          }
                          onMouseLeave={() => setHoveredParticipantId(null)}
                          onClick={() => handleParticipantClick(participant)}
                        >
                          <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6",
                                participant.response
                                  ? [
                                      "text-white",
                                      isCurrentUser && !isHistoricalRoom
                                        ? "bg-green-500"
                                        : "bg-blue-500",
                                    ]
                                  : [
                                      "text-gray-600 bg-white border-1",
                                      isCurrentUser && !isHistoricalRoom
                                        ? "border-green-500"
                                        : "border-blue-500",
                                    ]
                              )}
                            >
                              {participant.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold group-data-[collapsible=icon]:hidden">
                              {participant.name}
                              {isCurrentUser && !isHistoricalRoom && (
                                <span className="ml-2 text-xs text-green-600 font-normal">
                                  (You)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-auto group-data-[collapsible=icon]:hidden">
                            {isCurrentUser && !isHistoricalRoom && (
                              <div
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveParticipant(participant.id);
                                }}
                              >
                                <X
                                  className={`w-4 h-4 ${
                                    hoveredParticipantId === participant.id
                                      ? "block"
                                      : "hidden"
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
