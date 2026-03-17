import * as React from 'react'
import { cn } from '@/lib/utils'

interface FancyCardProps {
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
  [key: string]: any
}

export function FancyCard({ title, description, className, ...props }: FancyCardProps) {
  return (
    <div
      className={cn(
        'cursor-pointer group overflow-hidden p-5 duration-1000 hover:duration-1000 relative w-64 h-64 bg-neutral-800 rounded-xl',
        className,
      )}
      {...props}
    >
      <div className="group-hover:-rotate-45 bg-transparent group-hover:scale-150 -top-12 -left-12 absolute shadow-yellow-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24" />
      <div className="group-hover:rotate-45 bg-transparent group-hover:scale-150 top-44 left-14 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24" />
      <div className="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-24 left-56 absolute shadow-sky-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-24 h-24" />
      <div className="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-12 left-12 absolute shadow-red-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-12 h-12" />
      <div className="group-hover:rotate-45 bg-transparent group-hover:scale-150 top-12 left-12 absolute shadow-green-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-44 h-44" />
      <div className="group-hover:rotate-45 bg-transparent group-hover:scale-150 -top-24 -left-12 absolute shadow-sky-800 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-64 h-64" />
      <div className="group-hover:-rotate-45 bg-transparent group-hover:scale-150 top-24 left-12 absolute shadow-sky-500 shadow-inner rounded-xl transition-all ease-in-out group-hover:duration-1000 duration-1000 w-4 h-4" />

      <div className="w-full h-full shadow-xl shadow-neutral-900 p-3 bg-neutral-600 opacity-50 rounded-xl flex-col gap-2 flex justify-center">
        {title ? (
          <span className="text-neutral-50 font-bold text-xl italic">{title}</span>
        ) : (
          <span className="text-neutral-50 font-bold text-xl italic">Explore More</span>
        )}
        <p className="text-neutral-300">{description ?? 'Dive into curated collections and let curiosity guide your exploration.'}</p>
      </div>
    </div>
  )
}

export default FancyCard
