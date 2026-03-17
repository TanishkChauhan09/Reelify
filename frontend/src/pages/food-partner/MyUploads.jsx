import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import ReelFeed from '../../components/ReelFeed'
import '../../styles/reels.css'
import { Link } from 'react-router-dom'
import Toast from '../../components/Toast'

const MyUploads = () => {
  const [videos, setVideos] = useState([])
  const [analytics, setAnalytics] = useState({ totalLikes: 0, totalSaves: 0 })
  const [toast, setToast] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 6

  useEffect(() => {
    api.get(`/api/food/mine?page=${page}&limit=${limit}`)
      .then((res) => {
        const foods = res.data.foods || []
        setVideos(foods)
        const totalLikes = foods.reduce((sum, f) => sum + (f.likeCount || 0), 0)
        const totalSaves = foods.reduce((sum, f) => sum + (f.savesCount || 0), 0)
        setAnalytics({ totalLikes, totalSaves })
        setTotalPages(res.data.totalPages || 1)
      })
      .catch((err) => {
        console.error('Failed to load uploads:', err)
      })
  }, [page])

  const deleteUpload = async (item) => {
    const ok = window.confirm('Delete this upload? This cannot be undone.')
    if (!ok) return
    try {
      await api.delete(`/api/food/${item._id}`)
      const next = videos.filter((v) => v._id !== item._id)
      setVideos(next)
      const totalLikes = next.reduce((sum, f) => sum + (f.likeCount || 0), 0)
      const totalSaves = next.reduce((sum, f) => sum + (f.savesCount || 0), 0)
      setAnalytics({ totalLikes, totalSaves })
      setToast('Upload deleted')
    } catch (err) {
      console.error('Delete failed:', err)
      setToast('Delete failed. Please try again.')
    }
  }

  const likeOwn = async (item) => {
    if (item.isPartnerLiked) {
      setToast('Already liked')
      return
    }
    try {
      const response = await api.post('/api/food/partner-like', { foodId: item._id })
      setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: response.data.likeCount ?? v.likeCount + 1, isPartnerLiked: true } : v))
      setToast('Liked your upload')
    } catch (err) {
      console.error('Like failed:', err)
      setToast('Like failed')
    }
  }

  return (
    <div>
      <Toast message={toast} onClose={() => setToast('')} />
      <div style={{ padding: '16px 16px 0 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 600 }}>My Uploads</div>
        <div style={{ color: '#64748b' }}>Total Likes: {analytics.totalLikes}</div>
        <div style={{ color: '#64748b' }}>Total Saves: {analytics.totalSaves}</div>
        <Link to="/create-food" style={{ marginLeft: 'auto' }}>Upload New</Link>
      </div>
      <div style={{ padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <div style={{ fontSize: 12, color: '#64748b' }}>Page {page} / {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
      </div>
      <ReelFeed
        items={videos}
        onLike={likeOwn}
        onDelete={deleteUpload}
        emptyMessage="No uploads yet."
      />
    </div>
  )
}

export default MyUploads
