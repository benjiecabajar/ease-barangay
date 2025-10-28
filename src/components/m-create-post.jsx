import React, { useState, useEffect } from "react";
import { FaTimes, FaSyncAlt, FaCheckCircle } from "react-icons/fa";
import "../styles/moderator-home.css";
import "../styles/m-create-post.css";

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
  renderPreviewImages,
  editingPost,
  category,
  setCategory,
}) => {
  const [postCategories, setPostCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const systemSettings = JSON.parse(localStorage.getItem("system_settings")) || {};
      const defaultCategories = ['General', 'Event', 'Health Advisory', 'Safety Alert', 'Community Program', 'Traffic Update', 'Weather Alert', 'Maintenance Notice', 'Other'];
      setPostCategories(systemSettings.announcementCategories || defaultCategories);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // This function resets the form fields and closes the modal.
  const handleClose = () => {
    setTitle("");
    setDescription("");
    setImages([]);
    setCategory('General'); // Reset to default
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handlePost(); // This now handles both create and update
    // onClose is called inside handlePost after logic is complete
  };

  return (
    <div className="post-modal-overlay" onClick={handleClose}>
      <div
        className="post-modal-content post-form"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{editingPost ? "Edit Announcement" : "Create new Announcement"}</h2>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group-half">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {postCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <input
            type="text"
            placeholder="Add a title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required={false}
          />
          <textarea
            placeholder="Write something for the residents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <label htmlFor="file-upload" className="file-upload-label">
            <FaTimes style={{ visibility: "hidden" }} />
            <span style={{ flexGrow: 1, textAlign: "center" }}>Upload Image(s)</span>
            <input id="file-upload" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
            <FaTimes style={{ transform: "rotate(45deg)" }} />
          </label>

          {images.length > 0 && renderPreviewImages(images)}

          <button type="submit" disabled={!description.trim()}>
            {editingPost ? "Save Changes" : "Post Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;