import React from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'

function GalleryLoading (): React.ReactNode {
  return (
    <div className="gallery-loading" aria-live="polite" aria-busy="true">
      <LoadingSpinner />
    </div>
  )
}

export default GalleryLoading
