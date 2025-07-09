'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  IconSparkles,
  IconRefresh,
  IconSettings,
  IconPlus,
  IconBrandX,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'
import {
  generateTweetIdeas,
  markTweetAsUsed,
  deleteTweetIdea,
  createTweetStyleReference,
  updateTweetStyleReference,
  deleteTweetStyleReference,
} from '@/lib/actions/tweet-ideas'
import { toast } from 'sonner'
import type { TweetIdea, TweetGenerationSource, TweetStyleReference } from '@/types'
import { AddEditStyleReferenceDialog } from './tweet-ideas/add-edit-style-reference-dialog'
import { StyleReferencesList } from './tweet-ideas/style-references'
import { TweetIdeasList } from './tweet-ideas/tweet-ideas-list'

interface TweetIdeasectionProps {
  sourceData: TweetGenerationSource
  existingTweetIdeas: TweetIdea[]
  tweetStyleReferences: TweetStyleReference[]
}

type OptimisticTweetAction = 
  | { type: 'add'; tweets: TweetIdea[] }
  | { type: 'markUsed'; id: number }
  | { type: 'delete'; id: number }

type OptimisticReferenceAction = 
  | { type: 'add'; reference: TweetStyleReference }
  | { type: 'update'; id: number; data: Partial<TweetStyleReference> }
  | { type: 'delete'; id: number }

function optimisticTweetReducer(state: TweetIdea[], action: OptimisticTweetAction): TweetIdea[] {
  switch (action.type) {
    case 'add':
      return [...action.tweets, ...state]
    case 'markUsed':
      return state.map(tweet => 
        tweet.id === action.id ? { ...tweet, isUsed: true } : tweet
      )
    case 'delete':
      return state.filter(tweet => tweet.id !== action.id)
    default:
      return state
  }
}

function optimisticReferenceReducer(
  state: TweetStyleReference[], 
  action: OptimisticReferenceAction
): TweetStyleReference[] {
  switch (action.type) {
    case 'add':
      return [action.reference, ...state]
    case 'update':
      return state.map(ref => 
        ref.id === action.id ? { ...ref, ...action.data } : ref
      )
    case 'delete':
      return state.filter(ref => ref.id !== action.id)
    default:
      return state
  }
}

export function TweetIdeasSection({ sourceData, existingTweetIdeas, tweetStyleReferences }: TweetIdeasectionProps) {
  const [optimisticTweets, updateOptimisticTweets] = useOptimistic(
    existingTweetIdeas,
    optimisticTweetReducer,
  )
  const [optimisticReferences, updateOptimisticReferences] = useOptimistic(
    tweetStyleReferences,
    optimisticReferenceReducer,
  )
  const [, startTransition] = useTransition()
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showStyleReferences, setShowStyleReferences] = useState(false)
  const [isCreateReferenceModalOpen, setIsCreateReferenceModalOpen] = useState(false)
  const [editingReference, setEditingReference] = useState<TweetStyleReference | null>(null)
  const [referenceFormData, setReferenceFormData] = useState({
    tweetText: '',
    tweetUrl: '',
    author: '',
    notes: '',
  })

  const hasSourceData = 
    sourceData.todos.length > 0 ||
    sourceData.notes.length > 0 ||
    sourceData.dailyLogs.length > 0 ||
    sourceData.bookmarks.length > 0 ||
    sourceData.reminders.length > 0 ||
    !!sourceData.dailySummary

  const handleGenerateIdeas = async () => {
    if (!hasSourceData) {
      toast.error("No content found for today. Add some todos, notes, or daily logs first!")
      return
    }

    setIsGenerating(true)
    try {
      const newTweets = await generateTweetIdeas(sourceData)
      startTransition(() => {
        updateOptimisticTweets({ type: 'add', tweets: newTweets })
      })
      toast.success(`Generated ${newTweets.length} new tweet ideas!`)
    } catch (error) {
      toast.error('Failed to generate tweet ideas. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyTweet = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      toast.success('Tweet copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy tweet')
    }
  }

  const handleMarkAsUsed = (id: number) => {
    startTransition(() => {
      updateOptimisticTweets({ type: 'markUsed', id })
      markTweetAsUsed(id).catch(() => {
        toast.error('Failed to mark tweet as used')
      })
    })
  }

  const handleDeleteTweet = (id: number) => {
    startTransition(() => {
      updateOptimisticTweets({ type: 'delete', id })
      deleteTweetIdea(id).catch(() => {
        toast.error('Failed to delete tweet')
      })
    })
  }

  const openTweetComposer = (content: string) => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`
    window.open(tweetUrl, '_blank')
  }

  const resetReferenceForm = () => {
    setReferenceFormData({
      tweetText: '',
      tweetUrl: '',
      author: '',
      notes: '',
    })
  }

  const handleCreateReference = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!referenceFormData.tweetText.trim()) {
      toast.error('Tweet text is required')
      return
    }

    try {
      const newReference = await createTweetStyleReference({
        tweetText: referenceFormData.tweetText.trim(),
        tweetUrl: referenceFormData.tweetUrl.trim() || undefined,
        author: referenceFormData.author.trim() || undefined,
        notes: referenceFormData.notes.trim() || undefined,
      })

      startTransition(() => {
        updateOptimisticReferences({ type: 'add', reference: newReference })
      })
      toast.success('Tweet style reference added!')
      setIsCreateReferenceModalOpen(false)
      resetReferenceForm()
    } catch (error) {
      toast.error('Failed to add tweet style reference')
    }
  }

  const handleUpdateReference = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingReference || !referenceFormData.tweetText.trim()) {
      toast.error('Tweet text is required')
      return
    }

    try {
      const updatedReference = await updateTweetStyleReference(editingReference.id, {
        tweetText: referenceFormData.tweetText.trim(),
        tweetUrl: referenceFormData.tweetUrl.trim() || undefined,
        author: referenceFormData.author.trim() || undefined,
        notes: referenceFormData.notes.trim() || undefined,
      })

      startTransition(() => {
        updateOptimisticReferences({ 
          type: 'update', 
          id: editingReference.id, 
          data: updatedReference
        })
      })
      
      toast.success('Tweet style reference updated!')
      setEditingReference(null)
      resetReferenceForm()
    } catch (error) {
      toast.error('Failed to update tweet style reference')
    }
  }

  const handleEditReference = (reference: TweetStyleReference) => {
    setEditingReference(reference)
    setIsCreateReferenceModalOpen(true)
  }

  const handleToggleReferenceActive = (id: number, isActive: boolean) => {
    startTransition(() => {
      updateOptimisticReferences({ type: 'update', id, data: { isActive } })
      updateTweetStyleReference(id, { isActive }).catch(() => {
        toast.error('Failed to update reference')
      })
    })
  }

  const handleDeleteReference = (id: number) => {
    startTransition(() => {
      updateOptimisticReferences({ type: 'delete', id })
      deleteTweetStyleReference(id).catch(() => {
        toast.error('Failed to delete reference')
      })
    })
  }

  const openTweetUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const handleOpenCreateModal = () => {
    setEditingReference(null)
    resetReferenceForm()
    setIsCreateReferenceModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-foreground mb-1 text-[26px] font-bold select-none">Tweet Ideas</h1>
            <p className="text-muted-foreground text-lg select-none">
              AI-generated tweets based on your daily activities
            </p>
          </div>
            <div className="flex gap-2">
             <Button 
               variant="outline" 
               size="sm"
               className="!h-10 px-3 py-2 text-sm m-2"
               onClick={() => setShowStyleReferences(!showStyleReferences)}
             >
               <IconSettings className="mr-2 h-4 w-4" />
               Style References
               {showStyleReferences ? (
                 <IconChevronUp className="ml-2 h-4 w-4" />
               ) : (
                 <IconChevronDown className="ml-2 h-4 w-4" />
               )}
             </Button>
             
             <Button 
               onClick={handleGenerateIdeas}
               disabled={isGenerating || !hasSourceData}
               variant="outline"
               className="!h-10 px-3 py-2 text-sm m-2"
             >
               {isGenerating ? (
                 <>
                   <IconRefresh className="mr-2 h-4 w-4 animate-spin" />
                   Generating...
                 </>
               ) : (
                 <>
                   <IconSparkles className="mr-2 h-4 w-4" />
                   Generate Ideas
                 </>
               )}
             </Button>
           </div>
        </div>

        {!hasSourceData && (
          <Card className="pt-6">
            <CardContent>
              <p>
                <IconSparkles className="mr-2 inline h-4 w-4" />
                No content found for today. Add some todos, notes, or daily logs to generate tweet ideas!
              </p>
            </CardContent>
          </Card>
                 )}

         {showStyleReferences && (
           <Card className="mt-6">
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <IconBrandX className="h-5 w-5" />
                   <CardTitle>Tweet Style References</CardTitle>
                 </div>
                 <Button size="sm" onClick={handleOpenCreateModal}>
                   <IconPlus className="mr-2 h-4 w-4" />
                   Add Reference
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               <StyleReferencesList
                 references={optimisticReferences}
                 onEdit={handleEditReference}
                 onDelete={handleDeleteReference}
                 onToggleActive={handleToggleReferenceActive}
                 onOpenUrl={openTweetUrl}
                 onOpenCreateModal={handleOpenCreateModal}
               />
             </CardContent>
           </Card>
         )}
       </div>

      <TweetIdeasList
        tweets={optimisticTweets}
        copiedId={copiedId}
        onCopy={handleCopyTweet}
        onOpenComposer={openTweetComposer}
        onMarkAsUsed={handleMarkAsUsed}
        onDelete={handleDeleteTweet}
        onGenerate={handleGenerateIdeas}
        isGenerating={isGenerating}
        hasSourceData={hasSourceData}
      />

       <AddEditStyleReferenceDialog
         isOpen={isCreateReferenceModalOpen}
         onOpenChange={setIsCreateReferenceModalOpen}
         onSubmit={
           editingReference ? handleUpdateReference : handleCreateReference
         }
         referenceToEdit={editingReference}
         formData={referenceFormData}
         setFormData={setReferenceFormData}
       />
     </div>
   )
 } 