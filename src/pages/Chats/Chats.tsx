import { type FC } from "react";
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
          {hook.messages.chats.map((chat) => (
            <li
              key={chat.id}
              className={`${styles.contactItem} ${
                hook.messages.contactId === chat.id
                  ? styles.contactItemActive
                  : ""
              }`}
              onClick={() => hook.navigation.onContactClick(chat.id)}
            >
              <div className={styles.avatar} />
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>{chat.name}</div>
                {chat.lastMessage && (
                  <div className={styles.lastMessage}>{chat.lastMessage}</div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className={styles.sidebarFooter}>
          <button
            className={styles.logoutButton}
            onClick={hook.messages.logout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Chat area */}
      <main className={styles.chat}>
        {/* Messages */}
        <div className={styles.messages}>
          {hook.messages.messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.isMine ? styles.myMessage : styles.theirMessage
              }`}
            >
              <div className={styles.messageBubble}>{message.content}</div>
              <div className={styles.messageTime}>
                {formatDateTime(message.createdAt)}
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
