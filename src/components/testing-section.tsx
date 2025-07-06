'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser } from '@/hooks/use-current-user'
import { IconArrowUp, IconLoader, IconTrash } from '@tabler/icons-react'
import { useState, useRef, type FormEvent } from 'react'
import { clearAllMessages } from '@/lib/actions/messages'

export function TestingSection() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClearingMemory, setIsClearingMemory] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { user } = useCurrentUser()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [
                      {
                        from: user?.phoneNumber,
                        text: {
                          body: message,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      })

      const data = await res.json()
      setResponse(data.reply || JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error submitting test message:', error)
      setResponse('An error occurred while sending the message.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearMemory = async () => {
    if (isClearingMemory || !user) return

    setIsClearingMemory(true)
    
    try {
      await clearAllMessages(user.id)
      setResponse('Short term memory cleared successfully!')
    } catch (error) {
      console.error('Error clearing memory:', error)
      setResponse('An error occurred while clearing memory.')
    } finally {
      setIsClearingMemory(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold">
            Neura
          </h1>
          <p className="text-muted-foreground text-lg">
            Your WhatsApp-integrated AI assistant for seamless information
            management
          </p>
        </div>
        <Button
          onClick={handleClearMemory}
          disabled={isClearingMemory || !user}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isClearingMemory ? (
            <IconLoader className="h-4 w-4 animate-spin" />
          ) : (
            <IconTrash className="h-4 w-4" />
          )}
          Clear Memory
        </Button>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <div className="relative flex w-full items-center rounded-2xl border">
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask or find anything..."
            required
            className="min-h-[130px] flex-1 resize-none self-end border-none bg-card p-4 focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isLoading && message.trim()) {
                  formRef.current?.requestSubmit()
                }
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !user || !message.trim()}
            className="absolute bottom-3 right-3 shrink-0 rounded-full"
          >
            {isLoading ? (
              <IconLoader className="animate-spin" />
            ) : (
              <IconArrowUp />
            )}
          </Button>
        </div>
      </form>
      {response && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Response</h2>
          <pre className="mt-2 rounded-md">
            {response}
          </pre>
        </div>
      )}
    </div>
  )
} 