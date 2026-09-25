import { useSessionStore } from '@/store/session'
import ChatRoom from '@/components/chat-room'

const ChatPage = () => {
  const { endUrl, endLabel } = useSessionStore()
  return <ChatRoom endUrl={endUrl} endLabel={endLabel} />
}

export default ChatPage
