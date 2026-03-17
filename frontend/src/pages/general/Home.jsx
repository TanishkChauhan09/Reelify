import React, { useEffect, useState } from 'react'
import api from '../../lib/api';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const Home = () => {
    const [ videos, setVideos ] = useState([])
    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        api.get("/api/food")
            .then(response => {

                console.log(response.data);

                setVideos(response.data.foodItems)
            })
            .catch(() => { /* noop: optionally handle error */ })
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {

        const response = await api.post("/api/food/like", { foodId: item._id })

        if(response.data.like){
            console.log("Video liked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: response.data.likeCount ?? v.likeCount + 1, isLiked: true } : v))
        }else{
            console.log("Video unliked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: response.data.likeCount ?? Math.max(0, v.likeCount - 1), isLiked: false } : v))
        }
        
    }

    async function saveVideo(item) {
        const response = await api.post("/api/food/save", { foodId: item._id })
        
        if(response.data.save){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: response.data.savesCount ?? v.savesCount + 1, isSaved: true } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: response.data.savesCount ?? Math.max(0, v.savesCount - 1), isSaved: false } : v))
        }
    }

    const onCommentsCountChange = (foodId, count) => {
        setVideos((prev) => prev.map((v) => v._id === foodId ? { ...v, commentsCount: count } : v))
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            onCommentsCountChange={onCommentsCountChange}
            emptyMessage="No videos available."
        />
    )
}

export default Home
