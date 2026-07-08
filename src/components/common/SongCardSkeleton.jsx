import React from 'react'

export default function SongCardSkeleton() {
  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      {/* Cover Skeleton */}
      <div className="relative aspect-square w-full rounded-md bg-gray-200 dark:bg-gray-700 mb-3 overflow-hidden">
        {/* Play Button Skeleton */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0"></div>
      </div>
      
      {/* Info Skeleton */}
      <div className="px-1 space-y-2">
        {/* Title */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        {/* Artist */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        
        {/* Badges/Tags Skeleton */}
        <div className="flex gap-2 pt-1">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
