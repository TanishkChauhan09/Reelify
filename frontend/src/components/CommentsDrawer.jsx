import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { io } from 'socket.io-client'
import '../styles/comments.css'

const CommentsDrawer = ({ open, item, onClose, onCountChange }) => {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const fetchComments = () => {
    if (!item?._id) return
    setLoading(true)
    api.get(`/api/food/${item._id}/comments`)
      .then((res) => {
        const list = res.data.comments || []
        setComments(list)
        onCountChange?.(item._id, list.length)
      })
      .catch(() => {
        setComments([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!open || !item?._id) return
    fetchComments()
  }, [open, item?._id])

  useEffect(() => {
    if (!open || !item?._id) return
    const socket = io(api.defaults.baseURL, { withCredentials: true })
    socket.emit('join-food', item._id)
    socket.on('comment:new', (evt) => {
      if (evt.foodId === item._id) fetchComments()
    })
    socket.on('comment:update', (evt) => {
      if (evt.foodId === item._id) fetchComments()
    })
    socket.on('comment:delete', (evt) => {
      if (evt.foodId === item._id) fetchComments()
    })
    return () => {
      socket.disconnect()
    }
  }, [open, item?._id])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const res = await api.post(`/api/food/${item._id}/comments`, { text })
    setText('')
    if (typeof res.data?.commentsCount === 'number') {
      onCountChange?.(item._id, res.data.commentsCount)
    }
    fetchComments()
  }

  const react = async (commentId, emoji) => {
    await api.post(`/api/food/${item._id}/comments/${commentId}/react`, { emoji })
    fetchComments()
  }

  const startEdit = (c) => {
    setEditingId(c._id)
    setEditText(c.text)
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    if (!editingId || !editText.trim()) return
    const res = await api.patch(`/api/food/${item._id}/comments/${editingId}`, { text: editText })
    setEditingId(null)
    setEditText('')
    if (typeof res.data?.commentsCount === 'number') {
      onCountChange?.(item._id, res.data.commentsCount)
    }
    fetchComments()
  }

  const removeComment = async (c) => {
    const res = await api.delete(`/api/food/${item._id}/comments/${c._id}`)
    if (typeof res.data?.commentsCount === 'number') {
      onCountChange?.(item._id, res.data.commentsCount)
    }
    fetchComments()
  }

  if (!open) return null

  return (
    <div className="comments-overlay" role="dialog" aria-modal="true">
      <div className="comments-sheet">
        <div className="comments-header">
          <div className="comments-title">Comments</div>
          <button className="comments-close" onClick={onClose}>Close</button>
        </div>
        <div className="comments-body">
          {loading && <div className="comments-empty">Loading…</div>}
          {!loading && !item?._id && <div className="comments-empty">Select a video to view comments</div>}
          {!loading && item?._id && comments.length === 0 && <div className="comments-empty">Be the first to comment</div>}
          {comments.map((c) => (
            <div key={c._id} className="comment">
              <div className="comment-row">
                <div className="comment-name">{c.user?.fullName || 'User'}</div>
                {c.isMine && (
                  <div className="comment-actions">
                    <button onClick={() => startEdit(c)}>Edit</button>
                    <button onClick={() => removeComment(c)}>Delete</button>
                  </div>
                )}
              </div>
              {editingId === c._id ? (
                <form className="comment-edit" onSubmit={submitEdit}>
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <button type="submit">Save</button>
                </form>
              ) : (
                <div className="comment-text">{c.text}</div>
              )}
              <div className="comment-reactions">
                {['👍','❤️','😂','🔥','👏'].map((emoji) => {
                  const existing = (c.reactions || []).find((r) => r.emoji === emoji)
                  const count = existing?.count || 0
                  const active = existing?.isReacted
                  return (
                    <button
                      key={emoji}
                      className={`reaction ${active ? 'is-active' : ''}`}
                      onClick={() => react(c._id, emoji)}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="reaction-count">{count}</span>}
                    </button>
                  )
                })}
              </div>
              <div className="comment-time">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <form className="comments-input" onSubmit={submit}>
          <input
            type="text"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  )
}

export default CommentsDrawer
