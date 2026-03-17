import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import api from '../../lib/api'
import ReelFeed from '../../components/ReelFeed'

const Saved = () => {
    const [ videos, setVideos ] = useState([])

    useEffect(() => {
        api.get("/api/food/save")
            .then(response => {
                const savedFoods = response.data.savedFoods.map((item) => ({
                    _id: item.food._id,
                    video: item.food.video,
                    description: item.food.description,
                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,
                    foodPartner: item.food.foodPartner,
                    isSaved: true,
                    isLiked: item.food.isLiked
                }))
                setVideos(savedFoods)
            })
    }, [])

    const removeSaved = async (item) => {
        try {
            const response = await api.post("/api/food/save", { foodId: item._id })
            if (!response.data.save) {
                setVideos((prev) => prev.filter((v) => v._id !== item._id))
            }
        } catch {
            // noop
        }
    }

    return (
        <ReelFeed
            items={videos}
            onSave={removeSaved}
            onCommentsCountChange={(foodId, count) => setVideos((prev) => prev.map((v) => v._id === foodId ? { ...v, commentsCount: count } : v))}
            emptyMessage="No saved videos yet."
        />
    )
}

export default Saved
