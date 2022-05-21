import ChatMessageEvent from "./chat_message_event";

export default interface ChatListener {
  onMessage(message: ChatMessageEvent): void;
}