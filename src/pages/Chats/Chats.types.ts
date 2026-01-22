export type Contact = {
  id: string;
  name: string;
  lastMessage?: string;
  isGroup?: boolean;
};

export type Message = {
  id: string;
  author: string;
  content: string;
  time: string;
  isMine?: boolean;
};
