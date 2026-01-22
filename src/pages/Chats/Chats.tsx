import { type FC } from "react";
import { useChats } from "./Chats.hooks";
import { contacts } from "./Chats.statics";
import styles from "./Chats.module.css";

export const Chats: FC = () => {
  const hook = useChats();

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>COLLOSYNC</div>

        <ul className={styles.contactList}>
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className={styles.contactItem}
              onClick={() => hook.navigation.onContactClick(contact.id)}
            >
              <div className={styles.avatar} />
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>{contact.name}</div>
                <div className={styles.lastMessage}>{contact.lastMessage}</div>
              </div>
            </li>
          ))}
        </ul>
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
              <div className={styles.messageTime}>{message.time}</div>
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
