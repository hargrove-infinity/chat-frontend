import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { ADMIN_EVENTS, ADMIN_NAMESPACE } from "../../constants/socket";
import type { AdminSocket } from "../../state/appSlice.types";
import { getToken } from "../../utils/token";

export const Metrics = () => {
  useEffect(() => {
    const adminSocket: AdminSocket = io(
      `${import.meta.env.VITE_BASE_URL}${ADMIN_NAMESPACE}`,
      { auth: { token: getToken(), isAdmin: true } },
    );

    const onMetricsMessage = (msg: string) => {
      console.log("metrics message:", msg);
    };

    const onDisconnect = (reason: Socket.DisconnectReason): void => {
      console.log("Reason of disconnect:", reason);
    };

    const onConnectError = (error: Error) => {
      console.log("Error:", error);
    };

    adminSocket.on(ADMIN_EVENTS.METRICS, onMetricsMessage);
    adminSocket.on("connect_error", onConnectError);
    adminSocket.on("disconnect", onDisconnect);

    return () => {
      adminSocket.off(ADMIN_EVENTS.METRICS, onMetricsMessage);
      adminSocket.off("connect_error", onConnectError);
      adminSocket.off("disconnect", onDisconnect);
      adminSocket.disconnect();
    };
  }, []);

  return (
    <>
      <p>Metrics</p>
    </>
  );
};
