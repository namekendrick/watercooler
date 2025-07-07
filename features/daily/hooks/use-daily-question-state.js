import { create } from "zustand";
import { persist } from "zustand/middleware";

const dailyQuestion = (set, get) => ({
  // Question data
  dayIndex: null,
  currentQuestion: null,
  questionStateReady: false,

  // Participant data - now stored per room
  participantsByRoom: {}, // { roomCode: participantId }

  // Participant response viewing
  viewingParticipantId: null,

  // Response shuffle tracking
  viewedParticipantIds: {},

  // Hydration state
  hasHydrated: false,

  // Actions
  setDayIndex: (dayIndex) => set({ dayIndex }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setQuestionStateReady: (ready) => set({ questionStateReady: ready }),

  // Participant actions - updated to work with per-room storage
  setCurrentParticipant: (participantId, roomCode) => {
    set((state) => ({
      participantsByRoom: {
        ...state.participantsByRoom,
        [roomCode]: participantId,
      },
    }));
  },

  getCurrentParticipantId: (roomCode) => {
    const state = get();
    return state.participantsByRoom[roomCode] || null;
  },

  isCurrentParticipant: (participantId, roomCode) => {
    const state = get();
    return state.participantsByRoom[roomCode] === participantId;
  },

  isParticipantInRoom: (roomCode) => {
    const state = get();
    return state.participantsByRoom[roomCode] !== undefined;
  },

  clearParticipantData: (roomCode = null) => {
    if (roomCode) {
      // Clear specific room's participant
      set((state) => {
        const newParticipantsByRoom = { ...state.participantsByRoom };
        delete newParticipantsByRoom[roomCode];
        return { participantsByRoom: newParticipantsByRoom };
      });
    } else {
      // Clear all participant data (backward compatibility)
      set({
        participantsByRoom: {},
      });
    }
  },

  // Participant response viewing actions
  setViewingParticipantId: (participantId) => {
    set({ viewingParticipantId: participantId });
  },

  clearViewingParticipant: () => {
    set({ viewingParticipantId: null });
  },

  isViewingParticipantResponse: () => {
    const state = get();
    return state.viewingParticipantId !== null;
  },

  // Response shuffle actions
  getViewedParticipantIds: (roomCode) => {
    const state = get();
    return state.viewedParticipantIds[roomCode] || [];
  },

  markParticipantAsViewed: (participantId, roomCode) => {
    const state = get();
    const currentViewedIds = state.viewedParticipantIds[roomCode] || [];

    if (!currentViewedIds.includes(participantId)) {
      set({
        viewedParticipantIds: {
          ...state.viewedParticipantIds,
          [roomCode]: [...currentViewedIds, participantId],
        },
      });
    }
  },

  clearViewedResponses: (roomCode) => {
    const state = get();
    set({
      viewedParticipantIds: {
        ...state.viewedParticipantIds,
        [roomCode]: [],
      },
    });
  },

  getParticipantsWithResponses: (participants) => {
    if (!participants) return [];
    return participants.filter((participant) => participant.response?.text);
  },

  getNextRandomParticipant: (
    participants,
    roomCode,
    excludeParticipantId = null
  ) => {
    const state = get();
    if (!participants || !state.hasHydrated) return null;

    const participantsWithResponses = participants.filter(
      (participant) => participant.response?.text
    );

    // If no participants have responses, return null
    if (participantsWithResponses.length === 0) return null;

    const viewedIds = state.viewedParticipantIds[roomCode] || [];

    // If all responses have been viewed, restart the cycle
    if (participantsWithResponses.length === viewedIds.length) {
      set({
        viewedParticipantIds: {
          ...state.viewedParticipantIds,
          [roomCode]: [],
        },
      });

      // When restarting, exclude the current participant if provided
      const availableParticipants = excludeParticipantId
        ? participantsWithResponses.filter((p) => p.id !== excludeParticipantId)
        : participantsWithResponses;

      // If we have multiple participants, exclude the current one
      if (availableParticipants.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * availableParticipants.length
        );
        return availableParticipants[randomIndex];
      }

      // If only one participant (edge case), return it
      const randomIndex = Math.floor(
        Math.random() * participantsWithResponses.length
      );
      return participantsWithResponses[randomIndex];
    }

    // Get unviewed participants
    const unviewedParticipants = participantsWithResponses.filter(
      (participant) => !viewedIds.includes(participant.id)
    );

    if (unviewedParticipants.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * unviewedParticipants.length);
    return unviewedParticipants[randomIndex];
  },

  isLastUnviewedParticipant: (participantId, participants, roomCode) => {
    const state = get();
    if (!participants || !participantId || !roomCode) return false;

    const participantsWithResponses = participants.filter(
      (participant) => participant.response?.text
    );

    if (participantsWithResponses.length === 0) return false;

    const viewedIds = state.viewedParticipantIds[roomCode] || [];
    const unviewedParticipants = participantsWithResponses.filter(
      (participant) => !viewedIds.includes(participant.id)
    );

    // This is the last unviewed participant if there's only one unviewed participant
    // and it's the one being viewed
    return (
      unviewedParticipants.length === 1 &&
      unviewedParticipants[0].id === participantId
    );
  },

  setHasHydrated: (hasHydrated) => {
    set({ hasHydrated });
  },

  resetDailyState: (dayIndex) => {
    const state = get();
    // Reset response state if it's a new day
    if (state.dayIndex !== dayIndex) {
      set({
        dayIndex,
        viewedParticipantIds: {},
        // Clear all participant data when day changes since all rooms are now historical
        participantsByRoom: {},
      });
    }
  },
});

export const useDailyQuestionState = create(
  persist(dailyQuestion, {
    name: "daily-question",
    partialize: (state) => ({
      dayIndex: state.dayIndex,
      participantsByRoom: state.participantsByRoom,
      viewedParticipantIds: state.viewedParticipantIds,
    }),
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true);
    },
  })
);
