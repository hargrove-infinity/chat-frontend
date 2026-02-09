import { type FC } from "react";
import { MessageStatusEnum } from "../../api/types";
import { formatDateTime } from "../../utils/formatDateTime";
import { useChats } from "./Chats.hooks";
import styles from "./Chats.module.css";

export const Chats: FC = () => {
  const hook = useChats();

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.sidebarHeader}>COLLOSYNC</div>

        {/* Chats */}
        <ul className={styles.contactList}>
          {hook.chat.chats.map((chat) => (
            <li
              key={chat.id}
              className={`${styles.contactItem} ${
                hook.chat.chatId === chat.id ? styles.contactItemActive : ""
              }`}
              onClick={() => hook.navigation.onContactClick(chat.id)}
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar} />
                {chat.isOnline && <span className={styles.onlineBadge} />}
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>{chat.name}</div>
                {chat.lastMessage && (
                  <div className={styles.lastMessage}>{chat.lastMessage}</div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* User Info & Logout */}
        <div className={styles.sidebarFooter}>
          {hook.profile.user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {hook.profile.userInitials}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>
                  {hook.profile.user.firstName} {hook.profile.user.lastName}
                </div>
                <div className={styles.userEmail}>
                  {hook.profile.user.email}
                </div>
              </div>
            </div>
          )}
          <div className={styles.logoutWrapper}>
            <button className={styles.logoutButton} onClick={hook.auth.logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <main className={styles.chat}>
        {/* Messages */}
        <div className={styles.messages}>
          {hook.chat.messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.isMine ? styles.myMessage : styles.theirMessage
              } ${message.status === MessageStatusEnum.ERROR && styles.error}`}
            >
              {/* Sender name (optional) */}
              {!message.isMine && message.senderName && (
                <div className={styles.senderName}>{message.senderName}</div>
              )}
              {/* Message content */}
              <div className={styles.messageBubble}>{message.content}</div>
              {/* Message datetime & status */}
              <div className={styles.messageMeta}>
                {message.createdAt && (
                  <span className={styles.messageTime}>
                    {formatDateTime(message.createdAt)}
                  </span>
                )}

                {message.isMine && (
                  <div className={styles.messageStatus}>
                    {message.status === MessageStatusEnum.SENDING && (
                      <div className={styles.sendingClock} />
                    )}
                    {message.status === MessageStatusEnum.SENT && (
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        aria-hidden="true"
                        className={styles.checkIcon}
                      >
                        <polyline points="4 13 9 18 20 6" />
                      </svg>
                    )}
                    {message.status === MessageStatusEnum.ERROR && (
                      <div className={styles.errorContainer}>
                        <svg
                          className={styles.errorIcon}
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="11" />
                          <line x1="12" y1="6" x2="12" y2="14" />
                          <circle cx="12" cy="18" r="1.2" />
                        </svg>
                        {message.error && (
                          <span className={styles.errorText}>
                            {message.error}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <textarea
            className={styles.textarea}
            placeholder="Type a message..."
            value={hook.sendMessage.inputValue}
            onChange={(e) => hook.sendMessage.setInputValue(e.target.value)}
            onKeyDown={hook.sendMessage.handleKeyDown}
          />
          <button
            className={styles.sendButton}
            onClick={hook.sendMessage.handleSend}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};
