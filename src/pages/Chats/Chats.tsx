import { Fragment, type FC } from "react";
import { MessageStatusEnum } from "../../api/types";
import { formatDateTime } from "../../utils/formatDateTime";
import { useChats } from "./Chats.hooks";
import styles from "./Chats.module.css";
import { UserSearch } from "./UserSearch";
import { Modal } from "./Modal";

export const Chats: FC = () => {
  const hook = useChats();

  return (
    <Fragment>
      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Logo */}
          <div className={styles.sidebarHeader}>COLLOSYNC</div>

          {/* Search users trigger */}
          <button
            type="button"
            className={styles.searchTriggerButton}
            onClick={hook.modalUserSearch.openUserSearchModal}
          >
            <svg
              className={styles.searchTriggerIcon}
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search users</span>
          </button>

          {/* Chats */}
          <ul className={styles.contactList}>
            {hook.chat.chats.map((chat) => (
              <li
                key={chat.id}
                className={`${styles.contactItem} ${
                  hook.chat.chatId === chat.id ? styles.contactItemActive : ""
                }`}
                onClick={hook.navigation.onContactClick(chat.id)}
              >
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatar}>{chat.chatInitials}</div>
                  {chat.isOnline && <span className={styles.onlineBadge} />}
                </div>

                <div className={styles.contactInfo}>
                  <div className={styles.contactHeader}>
                    <div className={styles.contactName}>{chat.name}</div>
                    {chat.unreadMessages > 0 && (
                      <span className={styles.unreadBadge}>
                        {chat.unreadMessages}
                      </span>
                    )}
                  </div>
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
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {/* Head */}
                    <circle cx="12" cy="8" r="4" />
                    {/* Body */}
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
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
              <button
                className={styles.logoutButton}
                onClick={hook.profile.logout}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <main className={styles.chat}>
          {hook.chat.chatId ? (
            <Fragment>
              {/* Messages */}
              <div className={styles.messages}>
                {hook.chat.messages.map((message) => {
                  const isMessageUnread = message.reads.find(
                    (msgRead) =>
                      msgRead.userId === hook.profile.user?.id && !msgRead.read,
                  );

                  const isNotMineUnreadMessage =
                    !message.isMine && isMessageUnread;

                  const readCount = message.reads.filter((r) => r.read).length;
                  const totalReaders = message.reads.length;

                  return (
                    <div
                      key={message.id}
                      {...(isNotMineUnreadMessage && {
                        ref: hook.observer.setMessageNodeRef(message.id),
                      })}
                      data-message-id={message.id}
                      className={`${styles.message} ${
                        message.isMine ? styles.myMessage : styles.theirMessage
                      } ${message.status === MessageStatusEnum.ERROR && styles.error} ${
                        isMessageUnread ? styles.unreadMessage : ""
                      }`}
                    >
                      {/* Sender name (for incoming messages) */}
                      {!message.isMine && message.senderName && (
                        <div className={styles.senderName}>
                          {message.senderName}
                        </div>
                      )}

                      <div className={styles.messageBubble}>
                        {message.content}
                        {isNotMineUnreadMessage && (
                          <span className={styles.unreadIndicator} />
                        )}
                      </div>

                      {/* Read Receipt Menu - only for own messages in group chats */}
                      {message.isMine && hook.readReceiptMenu.isGroupChat && (
                        <div className={styles.readReceipt}>
                          <button
                            type="button"
                            data-read-button={message.id}
                            className={styles.readReceiptButton}
                            onClick={hook.readReceiptMenu.toggleReadMenu(
                              message.id,
                            )}
                            aria-label={`Read by ${readCount} of ${totalReaders}`}
                          >
                            <span className={styles.readCount}>Seen</span>
                          </button>

                          {/* Menu for group chat */}
                          {hook.readReceiptMenu.openReadMenuMessageId ===
                            message.id && (
                            <div
                              className={styles.readMenu}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className={styles.readMenuHeader}>
                                Read by {readCount} of {totalReaders}
                              </div>
                              {message.reads.map((readInfo) => (
                                <div
                                  key={readInfo.userId}
                                  className={styles.readMenuItem}
                                >
                                  <span className={styles.readMenuName}>
                                    {readInfo.userName}
                                  </span>
                                  {readInfo.read ? (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <g transform="translate(-1 -1) scale(1.15)">
                                        <path
                                          d="M3 6 L8 3 L13 6 M3 6 V12 H13 V6 M3 6 L8 10 L13 6"
                                          fill="none"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className={styles.readEnvelopeIcon}
                                        />
                                      </g>
                                    </svg>
                                  ) : (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M1.5 4.5 H14.5 V12.5 H1.5 Z M1.5 4.5 L8 10 L14.5 4.5"
                                        fill="none"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={styles.readEnvelopeIcon}
                                      />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`${styles.messageMeta} ${
                          message.isMine
                            ? styles.messageMetaMine
                            : styles.messageMetaOthers
                        }`}
                      >
                        {message.createdAt && (
                          <span className={styles.messageTime}>
                            {formatDateTime(message.createdAt)}
                          </span>
                        )}

                        {/* Original sending / error status (kept unchanged) */}
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

                            {message.status === MessageStatusEnum.READ && (
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                aria-hidden="true"
                                className={styles.readEyeIcon}
                              >
                                <path d="M12 9a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM12 5.5c4.6 0 8.5 3.1 9.7 7.4.1.4-.1.8-.5.9-.4.1-.8-.1-.9-.5C19.3 9.7 16 7 12 7s-7.3 2.7-8.3 6.3c-.1.4-.5.6-.9.5-.4-.1-.6-.5-.5-.9C3.5 8.6 7.4 5.5 12 5.5z" />
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
                  );
                })}
              </div>

              {/* Typing indicator */}
              {hook.typing.typingText && (
                <div className={styles.typingIndicator}>
                  <span className={styles.typingText}>
                    {hook.typing.typingText}
                  </span>
                  <span className={styles.typingDots}>
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              )}

              {/* Input */}
              <div className={styles.inputArea}>
                <textarea
                  className={styles.textarea}
                  placeholder="Type a message..."
                  value={hook.sendMessage.inputValue}
                  onChange={(e) =>
                    hook.sendMessage.setInputValue(e.target.value)
                  }
                  onKeyDown={hook.sendMessage.handleKeyDown}
                  onBlur={hook.sendMessage.emitStopTyping}
                />
                <button
                  className={styles.sendButton}
                  onClick={hook.sendMessage.handleSend}
                >
                  Send
                </button>
              </div>
            </Fragment>
          ) : (
            <div className={styles.emptyMessagesState}>
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </main>
      </div>
      <Modal
        isOpen={hook.modalUserSearch.isSearchOpen}
        onClose={hook.modalUserSearch.closeUserSearchModal}
        title="Search users"
        errors={hook.modalUserSearch.errors}
        footer={
          <Fragment>
            {hook.modalUserSearch.showGroupNameInput && (
              <div className={styles.groupNameField}>
                <input
                  className={`${styles.groupNameInput} ${
                    hook.modalUserSearch.groupNameError
                      ? styles.groupNameInputError
                      : ""
                  }`}
                  placeholder="Enter group chat name"
                  value={hook.modalUserSearch.groupChatName}
                  onChange={(e) =>
                    hook.modalUserSearch.setGroupChatName(e.target.value)
                  }
                />
                {hook.modalUserSearch.groupNameError && (
                  <span className={styles.groupNameErrorText}>
                    Enter name of chat
                  </span>
                )}
              </div>
            )}
            <button
              type="button"
              className={styles.createChatButton}
              disabled={hook.modalUserSearch.isCreateChatDisabled}
              onClick={hook.modalUserSearch.handleCreateChat}
            >
              {hook.modalUserSearch.createChatButtonText}
            </button>
          </Fragment>
        }
      >
        <UserSearch
          selectedUserIds={hook.modalUserSearch.selectedUserIds}
          onToggleUser={hook.modalUserSearch.toggleUserSelection}
        />
      </Modal>
    </Fragment>
  );
};
