import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Upload, Music, CheckCircle, RefreshCw } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import { getAudioDuration } from "../../utils/audioUtils"

import { uploadAudioAPI, updateAudioAPI, transformApiSong, parseDurationToMs } from "../../utils/apiUtils"

export default function UploadModal({ onClose, editSong = null }) {
  const { dispatch } = useMusic()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    genre: "",
  })
  const fileInputRef = useRef(null)
  // Cover image states
  const [selectedCover, setSelectedCover] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const coverInputRef = useRef(null)

  // New state for tracking if user wants to replace the audio file in edit mode
  const [replaceAudioFile, setReplaceAudioFile] = useState(false)

  // Check if we're in edit mode
  const isEditMode = editSong !== null

  useEffect(() => {
    setIsVisible(true)

    // If editing, populate the form with existing data
    if (isEditMode && editSong) {
      setFormData({
        title: editSong.title || "",
        artist: editSong.artist || "",
        genre: editSong.genre || "",
      })
      setCoverPreview(editSong.cover || null)
    }
  }, [isEditMode, editSong])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type.startsWith("audio/")) {
      setSelectedFile(files[0])
      if (isEditMode) {
        setReplaceAudioFile(true)
      }
      if (!formData.title || (isEditMode && replaceAudioFile)) {
        setFormData((prev) => ({
          ...prev,
          title: files[0].name.replace(/\.[^/.]+$/, ""),
        }))
      }
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("audio/")) {
      setSelectedFile(file)
      if (isEditMode) {
        setReplaceAudioFile(true)
      }
      if (!formData.title || (isEditMode && replaceAudioFile)) {
        setFormData((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }))
      }
    }
  }

  const handleCoverSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedCover(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReplaceAudio = () => {
    setReplaceAudioFile(true)
    setSelectedFile(null)
  }

  const handleCancelReplaceAudio = () => {
    setReplaceAudioFile(false)
    setSelectedFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let durationStr = "0:00"
      
      if (selectedFile) {
        durationStr = await getAudioDuration(selectedFile)
      } else if (isEditMode && editSong) {
        durationStr = editSong.duration
      }

      const durationMs = parseDurationToMs(durationStr)
      const data = new FormData()
      
      // Basic Metadata
      data.append("title", formData.title)
      data.append("genre", formData.genre || "Unknown Genre")
      data.append("singer", formData.artist || "Unknown Artist")
      data.append("duration", durationMs)
      data.append("isPrivate", "false") // Defaulting to public

      // Audio file (only append if there's a new selected file)
      if (selectedFile) {
        data.append("audio", selectedFile)
      }
      
      // Cover file (only append if it's a File object, not a string URL)
      if (selectedCover instanceof File) {
        data.append("cover", selectedCover)
      }

      let returnedAudioData;
      
      if (isEditMode) {
        const response = await updateAudioAPI(editSong.id, data)
        returnedAudioData = response.audio
      } else {
        if (!selectedFile) throw new Error("Audio file is required for new uploads")
        if (!selectedCover || !(selectedCover instanceof File)) throw new Error("Cover image is required for new uploads")
        
        const response = await uploadAudioAPI(data)
        returnedAudioData = response.audio
      }

      const songData = transformApiSong(returnedAudioData)
      songData.isUploaded = true // Explicitly mark it for the UI

      if (isEditMode) {
        dispatch({ type: "UPDATE_UPLOAD", payload: songData })
      } else {
        dispatch({ type: "ADD_UPLOAD", payload: songData })
      }

      setUploadSuccess(true)
      window.dispatchEvent(new CustomEvent('songUploaded'))
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadSuccess) {
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4">
        <div
          className={`card rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl text-center transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
            }`}
        >
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-bold mb-2">
            {isEditMode ? "Update Successful!" : "Upload Successful!"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isEditMode
              ? "Your song has been updated successfully."
              : "Your song has been added to your library."
            }
          </p>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[60] p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`bg-white dark:bg-gray-800 card rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl mt-4 sm:mt-8 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold">
            {isEditMode ? "Edit Song" : "Upload Song"}
          </h2>
          <button
            onClick={handleClose}
            className="btn-ghost p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isUploading}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <div
              className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-200 cursor-pointer ${dragActive
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-purple-400"
                }`}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <div className="space-y-2 sm:space-y-3">
                  <img
                    src={coverPreview || "/placeholder.svg"}
                    alt="Cover preview"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-xs sm:text-sm font-medium">Cover Image Selected</p>
                  <p className="text-xs text-gray-500">Tap to change cover</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">Drop your cover image here</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG supported</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary px-3 py-2 rounded-lg text-xs"
                  >
                    Choose Cover
                  </button>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Music File Upload/Replace Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Music File</label>

              {/* In edit mode, show replace/cancel buttons when not replacing */}
              {isEditMode && !replaceAudioFile && (
                <button
                  type="button"
                  onClick={handleReplaceAudio}
                  className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace</span>
                </button>
              )}
            </div>

            {/* Show current file info in edit mode when not replacing */}
            {isEditMode && !replaceAudioFile ? (
              <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center bg-gray-50 dark:bg-gray-700/50">
                <Music className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <p className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">Current Audio File</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tap "Replace" to upload a new file
                </p>
              </div>
            ) : (
              /* Show upload area for new uploads or when replacing in edit mode */
              <div>
                <div
                  className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center transition-all duration-200 ${dragActive
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-400"
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-2 sm:space-y-3">
                      <Music className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto" />
                      <p className="font-medium text-xs sm:text-sm break-all">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                          if (isEditMode) {
                            setReplaceAudioFile(false)
                          } else {
                            setFormData((prev) => ({ ...prev, title: "" }))
                          }
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 underline"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="font-medium text-xs sm:text-sm">
                          {isEditMode ? "Drop your new music file here" : "Drop your music file here"}
                        </p>
                        <p className="text-xs text-gray-500">Supports MP3, WAV, M4A, and more</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary px-3 py-2 rounded-lg text-xs"
                      >
                        Choose File
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>

                {/* Cancel replace option in edit mode */}
                {isEditMode && replaceAudioFile && (
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={handleCancelReplaceAudio}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Cancel replacement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Song Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="input-primary w-full px-3 py-2.5 sm:py-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400"
                required
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Artist *</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData((prev) => ({ ...prev, artist: e.target.value }))}
                className="input-primary w-full px-3 py-2.5 sm:py-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400"
                required
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData((prev) => ({ ...prev, genre: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Pop, Hip Hop, Electronic"
                disabled={isUploading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !formData.title ||
              !formData.artist ||
              (!isEditMode && !selectedFile) ||
              (isEditMode && replaceAudioFile && !selectedFile) ||
              isUploading
            }
            className="btn-primary w-full py-3 rounded-lg text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading
              ? (isEditMode ? "Updating..." : "Uploading...")
              : (isEditMode ? "Save Changes" : "Upload Song")
            }
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}