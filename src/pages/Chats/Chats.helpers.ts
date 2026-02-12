import type { Participant } from "../../api/types";

/**
 * Generates typing indicator text based on number of typing participants
 */
export const getTypingText = (participants: Participant[]): string | null => {
  switch (participants.length) {
    case 0:
      return null;

    case 1:
      return `${participants[0].name ?? "User"} is typing`;

    case 2:
      return `${participants[0].name}, ${participants[1].name} are typing`;

    default:
      return "Several people are typing";
  }
};
