import { api } from "@/lib/api-client"

// Who saves is taken from the session on the server — only the quack id is sent.
export async function saveQuack(quackId: string): Promise<void> {
  await api.put(`saved/${encodeURIComponent(quackId)}`)
}

export async function unsaveQuack(quackId: string): Promise<void> {
  await api.delete(`saved/${encodeURIComponent(quackId)}`)
}
