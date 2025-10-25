
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/moderator-home.css";

// =========================================================
// Post Modal Component (moved from ModeratorHome)
// =========================================================
const PostModal = ({ 
    isOpen, 
    onClose, 
    title, 
    setTitle, 
    description, 
    setDescription, 
    images, 
    setImages, 
    handlePost,
    handleImageChange,
    renderPreviewImages 
}) => {
    if (!isOpen) return null;

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setImages([]);
        onClose();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handlePost();
        onClose();
    };

    return (
        <div className="post-modal-overlay" onClick={handleClose}>
            <div 
                className="post-modal-content post-form" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Create New Announcement</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        placeholder="Add a title (Optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Write something for the residents..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    
                    <label htmlFor="file-upload" className="file-upload-label">
                        <FaTimes style={{visibility:'hidden'}} />
                        <span style={{flexGrow: 1, textAlign: 'center'}}>Upload Image(s)</span>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{display: 'none'}}
                        />
                        <FaTimes style={{transform: 'rotate(45deg)'}} />
                    </label>

                    {images.length > 0 && renderPreviewImages(images)}

                    <button type="submit" disabled={!description.trim()}>Post Announcement</button>
                </form>
            </div>
        </div>
    );
};

// =========================================================
// MAnnouncement Page
// =========================================================
function MAnnouncement() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);

    // Handle image upload
    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).map((file) =>
                URL.createObjectURL(file)
            );
            setImages(filesArray);
        }
    };

    // Handle posting an announcement
    const handlePost = () => {
        if (title.trim() || description.trim()) {
            const newPost = {
                id: Date.now(),
                title,
                description,
                images,
                author: "Community Moderator",
                date: new Date().toLocaleString(),
            };
            setPosts([newPost, ...posts]);
            setTitle("");
            setDescription("");
            setImages([]);
        }
    };

    // Image preview rendering
    const renderPreviewImages = (previewImages) => {
        const totalImages = previewImages.length;
        return (
            <div className={`preview-images preview-images-${Math.min(totalImages, 4)}`}>
                {previewImages.slice(0, 4).map((img, index) => (
                    <img src={img} alt={`preview ${index}`} key={index} />
                ))}
                {previewImages.length > 4 && (
                    <div className="preview-count-overlay">
                        <span>+{previewImages.length - 4}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="announcement-page">
            <button 
                className="create-announcement-btn"
                onClick={() => setIsPostModalOpen(true)}
            >
                + Create Announcement
            </button>

            <PostModal 
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                images={images}
                setImages={setImages}
                handlePost={handlePost}
                handleImageChange={handleImageChange}
                renderPreviewImages={renderPreviewImages}
            />

            <div className="announcements-feed">
                {posts.length === 0 ? (
                    <p>No announcements yet.</p>
                ) : (
                    posts.map((post) => (
                        <div className="announcement-card" key={post.id}>
                            {post.title && <h3>{post.title}</h3>}
                            <p>{post.description}</p>
                            {post.images && post.images.length > 0 && (
                                <div className="announcement-images">
                                    {post.images.map((img, idx) => (
                                        <img key={idx} src={img} alt="announcement" />
                                    ))}
                                </div>
                            )}
                            <small>{post.author} • {post.date}</small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MAnnouncement;

