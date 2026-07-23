import React, { useEffect } from "react"

interface ModalProps{
  children: React.ReactNode;
  isOpen: boolean;
  setState: (e: boolean) => void;
}

export default function Modal({ children, isOpen, setState }: ModalProps) {

  useEffect(() => {
    const handleClose = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault()

        setState(!isOpen)

      }
    }

    window.addEventListener('keyup', handleClose)

    return () => {
      window.removeEventListener('keyup', handleClose)
    }

  },[isOpen])

  if(!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-w-md bg-[#1b1b1c] border border-[#1b1b1c] p-8 rounded-2xl shadow-2xl text-[#c1c6d7] min-w-3xs">
        <div className="absolute top-0 right-0 p-3">
          <button
            onClick={() => setState(!isOpen)}
            className="text-[#c1c6d7] cursor-pointer hover:text-[#4ae176] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
