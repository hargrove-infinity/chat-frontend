import type { Contact, Message } from "./Chats.types";

export const contacts: Contact[] = [
  {
    id: "c2948a6a-b223-4cc9-a923-13dc5709c260",
    name: "Avery Collins",
    lastMessage: "Got it. I’ll start looking tonight.",
  },
  {
    id: "afc42415-7a02-4721-a1af-41c87efc6c64",
    name: "Shop Support",
    lastMessage: "Awesome! Let us know if you need any help.",
    isGroup: true,
  },
  {
    id: "ea610fdf-ff2d-4f16-b739-58c5c54d29ab",
    name: "Ryan Mitchell",
    lastMessage: "Yes, Friday end of day.",
  },
  {
    id: "c8e93dd2-248f-4e0c-8781-2d2cdad47b56",
    name: "Daniel Harris",
    lastMessage: "Will do. Pushing the fix in a few minutes.",
  },
  {
    id: "ae54cfa1-c1f8-4236-9394-a68ccfc38206",
    name: "Christopher Reynolds",
    lastMessage: "Cool, I’ll text you tomorrow with the plan.",
  },
];

const messages_1: Message[] = [
  {
    id: "1",
    author: "Avery",
    content: "Hey! Have you decided where you want to go for the summer trip?",
    time: "9:00 AM",
  },
  {
    id: "2",
    author: "You",
    content:
      "Not yet 😅 I’m thinking somewhere with beaches and good hiking trails.",
    time: "9:02 AM",
    isMine: true,
  },
  {
    id: "3",
    author: "Avery",
    content:
      "Ooh nice! Maybe Costa Rica? You get both beaches and volcano hikes.",
    time: "9:03 AM",
  },
  {
    id: "4",
    author: "You",
    content: "That sounds perfect! Any cities you recommend staying in?",
    time: "9:05 AM",
    isMine: true,
  },
  {
    id: "5",
    author: "Avery",
    content:
      "La Fortuna for hiking and Arenal Volcano, then Manuel Antonio for beaches.",
    time: "9:06 AM",
  },
  {
    id: "6",
    author: "You",
    content: "Sweet. How long do you think we need to see both places?",
    time: "9:08 AM",
    isMine: true,
  },
  {
    id: "7",
    author: "Avery",
    content: "I’d say 5-6 days. Two in La Fortuna, three in Manuel Antonio.",
    time: "9:09 AM",
  },
  {
    id: "8",
    author: "You",
    content: "Cool. Should we book flights now or wait for deals?",
    time: "9:10 AM",
    isMine: true,
  },
  {
    id: "9",
    author: "Avery",
    content:
      "Maybe check deals this week, but don’t wait too long, summer is peak season.",
    time: "9:11 AM",
  },
  {
    id: "10",
    author: "You",
    content: "Got it. I’ll start looking tonight.",
    time: "9:12 AM",
    isMine: true,
  },
];

const messages_2: Message[] = [
  {
    id: "1",
    author: "Alex",
    content: "Hi! Do you have information about the new Nike running shoes?",
    time: "10:01 AM",
    isMine: true,
  },
  {
    id: "2",
    author: "Support",
    content: "Hi Alex 👋 Yes, which model are you interested in?",
    time: "10:02 AM",
  },
  {
    id: "3",
    author: "Alex",
    content: "The Air Zoom Pegasus 40.",
    time: "10:03 AM",
    isMine: true,
  },
  {
    id: "4",
    author: "Support",
    content:
      "Sure! They are available in sizes 7–12. Would you like the size chart?",
    time: "10:04 AM",
  },
  {
    id: "5",
    author: "Alex",
    content: "Yes, please.",
    time: "10:05 AM",
    isMine: true,
  },
  {
    id: "6",
    author: "Support",
    content: "Here you go. I’ve also attached images and pricing details.",
    time: "10:06 AM",
  },
  {
    id: "7",
    author: "Alex",
    content: "Great, thanks! Do you offer free returns?",
    time: "10:07 AM",
    isMine: true,
  },
  {
    id: "8",
    author: "Support",
    content: "Yes, free returns within 30 days.",
    time: "10:08 AM",
  },
  {
    id: "9",
    author: "Alex",
    content: "Perfect, I’ll place an order today.",
    time: "10:09 AM",
    isMine: true,
  },
  {
    id: "10",
    author: "Support",
    content: "Awesome! Let us know if you need any help.",
    time: "10:10 AM",
  },
];

const messages_3: Message[] = [
  {
    id: "1",
    author: "Ryan",
    content: "Hey, do you have the latest version of the dashboard design?",
    time: "3:15 PM",
  },
  {
    id: "2",
    author: "You",
    content: "Hi Emma! Yes, I updated it yesterday.",
    time: "3:16 PM",
    isMine: true,
  },
  {
    id: "3",
    author: "Ryan",
    content: "Great. Were the mobile layouts included?",
    time: "3:17 PM",
  },
  {
    id: "4",
    author: "You",
    content: "Yes, both tablet and mobile views are ready.",
    time: "3:18 PM",
    isMine: true,
  },
  {
    id: "5",
    author: "Ryan",
    content: "Nice 👍 Can you share the Figma link?",
    time: "3:19 PM",
  },
  {
    id: "6",
    author: "You",
    content: "Sure, sending it now.",
    time: "3:20 PM",
    isMine: true,
  },
  {
    id: "7",
    author: "Ryan",
    content: "Thanks! I’ll review and leave comments.",
    time: "3:21 PM",
  },
  {
    id: "8",
    author: "You",
    content: "Sounds good. Let me know if something needs adjustment.",
    time: "3:22 PM",
    isMine: true,
  },
  {
    id: "9",
    author: "Ryan",
    content: "Will do. Deadline is still Friday, right?",
    time: "3:23 PM",
  },
  {
    id: "10",
    author: "You",
    content: "Yes, Friday end of day.",
    time: "3:24 PM",
    isMine: true,
  },
];

const messages_4: Message[] = [
  {
    id: "1",
    author: "Daniel",
    content: "Hey, did you notice the 500 error on the /metrics endpoint?",
    time: "10:02 AM",
  },
  {
    id: "2",
    author: "You",
    content:
      "Yeah, I saw it this morning. It happens when the token is missing.",
    time: "10:03 AM",
    isMine: true,
  },
  {
    id: "3",
    author: "Daniel",
    content: "Got it. Is it a backend validation issue?",
    time: "10:04 AM",
  },
  {
    id: "4",
    author: "You",
    content: "Exactly. The guard throws before the controller is reached.",
    time: "10:05 AM",
    isMine: true,
  },
  {
    id: "5",
    author: "Daniel",
    content: "Should we return 401 instead of 500?",
    time: "10:06 AM",
  },
  {
    id: "6",
    author: "You",
    content: "Yes, I’ll map it to an UnauthorizedException.",
    time: "10:07 AM",
    isMine: true,
  },
  {
    id: "7",
    author: "Daniel",
    content: "Nice. Do we need to update the frontend handling?",
    time: "10:08 AM",
  },
  {
    id: "8",
    author: "You",
    content: "Probably just redirect to /login on 401.",
    time: "10:09 AM",
    isMine: true,
  },
  {
    id: "9",
    author: "Daniel",
    content: "Cool. Let me know when it’s deployed.",
    time: "10:10 AM",
  },
  {
    id: "10",
    author: "You",
    content: "Will do. Pushing the fix in a few minutes.",
    time: "10:11 AM",
    isMine: true,
  },
];

const messages_5: Message[] = [
  {
    id: "1",
    author: "Christopher",
    content: "Hey! Did you watch the new season of Stranger Things?",
    time: "8:10 PM",
  },
  {
    id: "2",
    author: "You",
    content: "Not yet! Planning to binge it this weekend.",
    time: "8:11 PM",
    isMine: true,
  },
  {
    id: "3",
    author: "Christopher",
    content: "Oh man, the first episode is insane! You’re gonna love it.",
    time: "8:12 PM",
  },
  {
    id: "4",
    author: "You",
    content: "Excited! Don’t spoil anything though 😅",
    time: "8:13 PM",
    isMine: true,
  },
  {
    id: "5",
    author: "Christopher",
    content: "Promise, no spoilers. But the Upside Down scenes are next level!",
    time: "8:14 PM",
  },
  {
    id: "6",
    author: "You",
    content: "Sounds awesome. I need popcorn and snacks ready.",
    time: "8:15 PM",
    isMine: true,
  },
  {
    id: "7",
    author: "Christopher",
    content: "Haha yes! Don’t forget soda. It makes it more cinematic.",
    time: "8:16 PM",
  },
  {
    id: "8",
    author: "You",
    content: "Absolutely 😎. Want to do a watch-along call this weekend?",
    time: "8:17 PM",
    isMine: true,
  },
  {
    id: "9",
    author: "Christopher",
    content: "Totally, that would be fun! Let’s set a time.",
    time: "8:18 PM",
  },
  {
    id: "10",
    author: "You",
    content: "Cool, I’ll text you tomorrow with the plan.",
    time: "8:19 PM",
    isMine: true,
  },
];

export const messagesMap: { [key: string]: Message[] } = {
  "c2948a6a-b223-4cc9-a923-13dc5709c260": messages_1,
  "afc42415-7a02-4721-a1af-41c87efc6c64": messages_2,
  "ea610fdf-ff2d-4f16-b739-58c5c54d29ab": messages_3,
  "c8e93dd2-248f-4e0c-8781-2d2cdad47b56": messages_4,
  "ae54cfa1-c1f8-4236-9394-a68ccfc38206": messages_5,
};
