import type { MessageServer } from "../../api/types";

/**
 * Acknowledgment response from server after sending a message via Socket.IO
 * Discriminated union based on success/failure
 */
export type SendMessageAck =
  | {
      ok: true;
      /** Temporary ID from the original request for matching optimistic message */
      tempId: string;
      /** Server-generated message with real ID and timestamps */
      message: MessageServer;
    }
  | {
      ok: false;
      /** Temporary ID from the original request for matching optimistic message */
      tempId: string;
      /** Error description from server explaining why the send failed */
      error: string;
    };
