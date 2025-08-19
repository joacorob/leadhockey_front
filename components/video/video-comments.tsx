"use client"

import { useState } from "react"
import { Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface VideoCommentsProps {
  videoId: string
}

export function VideoComments({ videoId }: VideoCommentsProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "Mike Thompson",
        avatar: "/hockey-player-headshot.png"
      },
      content: "Great tutorial! The stick handling techniques really helped improve my game. Thanks for sharing!",
      timestamp: "2 hours ago",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: "1-1",
          author: {
            name: "Coach Sarah Johnson",
            avatar: "/hockey-coach-headshot.png"
          },
          content: "Glad it helped! Keep practicing those drills and you'll see even more improvement.",
          timestamp: "1 hour ago",
          likes: 5,
          isLiked: false
        }
      ]
    },
    {
      id: "2",
      author: {
        name: "Emma Wilson",
        avatar: "/female-hockey-player-headshot.png"
      },
      content: "The defensive positioning section was exactly what I needed. Can you do more videos on defensive strategies?",
      timestamp: "4 hours ago",
      likes: 8,
      isLiked: true
    },
    {
      id: "3",
      author: {
        name: "Alex Rodriguez",
        avatar: "/young-hockey-player-headshot.png"
      },
      content: "Amazing content as always! The slow-motion breakdowns really help understand the technique.",
      timestamp: "6 hours ago",
      likes: 15,
      isLiked: false
    }
  ])

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: "Current User",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isLiked: false
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: {
        name: "Current User",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      content: replyContent,
      timestamp: "Just now",
      likes: 0,
      isLiked: false
    }

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        }
      }
      return comment
    }))

    setReplyContent("")
    setReplyingTo(null)
  }

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    setComments(comments.map(comment => {
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked: !reply.isLiked,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
              }
            }
            return reply
          })
        }
      } else if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        }
      }
      return comment
    }))
  }

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment, isReply?: boolean, parentId?: string }) => (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm text-gray-900">{comment.author.name}</span>
              <span className="text-xs text-gray-500">{comment.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <Button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              variant="ghost"
              size="sm"
              className={`h-auto p-1 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            
            {!isReply && (
              <Button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-gray-500"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/placeholder.svg?height=24&width=24" alt="You" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    onClick={() => setReplyingTo(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSubmitReply(comment.id)}
                    size="sm"
                    disabled={!replyContent.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments ({comments.length})</h2>

      {/* Add Comment Form */}
      <div className="mb-8">
        <div className="flex space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px]"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Comment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Load More Comments */}
      {comments.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">Load more comments</Button>
        </div>
      )}
    </div>
  )
}
