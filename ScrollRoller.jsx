import { useState, useEffect, useRef, useCallback } from 'react'

const ScrollRoller = ({ 
  containerRef, 
  isVisible = true, 
  autoHideDelay = 3000,
  color = '#a3c9f1',
  width = 8 
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipText, setTooltipText] = useState('')
  const rollerRef = useRef(null)
  const thumbRef = useRef(null)
  const hideTimeoutRef = useRef(null)
  const lastScrollTime = useRef(0)

  // Check if device supports touch
  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  // Calculate scroll percentage and update roller position
  const updateScrollPosition = useCallback(() => {
    if (!containerRef?.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    
    if (scrollHeight <= clientHeight) {
      setScrollPercentage(0)
      return
    }

    const maxScroll = scrollHeight - clientHeight
    const percentage = Math.min(Math.max(scrollTop / maxScroll, 0), 1)
    setScrollPercentage(percentage)

    // Update tooltip text based on scroll position
    const totalItems = Math.floor(scrollHeight / 100) // Approximate item count
    const currentItem = Math.floor(percentage * totalItems)
    setTooltipText(`${currentItem + 1} / ${totalItems}`)
  }, [containerRef])

  // Handle scroll events
  const handleScroll = useCallback(() => {
    updateScrollPosition()
    
    // Show roller on scroll
    setIsActive(true)
    lastScrollTime.current = Date.now()

    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    // Auto-hide after delay
    hideTimeoutRef.current = setTimeout(() => {
      if (!isDragging && Date.now() - lastScrollTime.current >= autoHideDelay) {
        setIsActive(false)
      }
    }, autoHideDelay)
  }, [autoHideDelay, isDragging, updateScrollPosition])

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (!isTouchDevice() || !containerRef?.current) return

    e.preventDefault()
    setIsDragging(true)
    setIsActive(true)
    setShowTooltip(true)

    // Clear auto-hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }, [containerRef, isTouchDevice])

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !containerRef?.current || !rollerRef.current) return

    e.preventDefault()
    
    const touch = e.touches[0]
    const rollerRect = rollerRef.current.getBoundingClientRect()
    const container = containerRef.current
    
    // Calculate relative position within roller
    const relativeY = touch.clientY - rollerRect.top
    const rollerHeight = rollerRect.height
    const percentage = Math.min(Math.max(relativeY / rollerHeight, 0), 1)
    
    // Calculate scroll position
    const maxScroll = container.scrollHeight - container.clientHeight
    const newScrollTop = percentage * maxScroll
    
    // Apply scroll
    container.scrollTop = newScrollTop
    updateScrollPosition()
  }, [isDragging, containerRef, updateScrollPosition])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setShowTooltip(false)
    
    // Start auto-hide timer
    lastScrollTime.current = Date.now()
    hideTimeoutRef.current = setTimeout(() => {
      setIsActive(false)
    }, autoHideDelay)
  }, [autoHideDelay])

  // Handle quick swipe gestures for jump to top/bottom
  const handleQuickSwipe = useCallback((direction) => {
    if (!containerRef?.current) return

    const container = containerRef.current
    const targetScroll = direction === 'top' ? 0 : container.scrollHeight - container.clientHeight

    // Smooth scroll to target
    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })
  }, [containerRef])

  // Setup event listeners
  useEffect(() => {
    const container = containerRef?.current
    if (!container || !isTouchDevice()) return

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true })
    
    // Add touch listeners to roller
    const roller = rollerRef.current
    if (roller) {
      roller.addEventListener('touchstart', handleTouchStart, { passive: false })
      roller.addEventListener('touchmove', handleTouchMove, { passive: false })
      roller.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    // Initial position update
    updateScrollPosition()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (roller) {
        roller.removeEventListener('touchstart', handleTouchStart)
        roller.removeEventListener('touchmove', handleTouchMove)
        roller.removeEventListener('touchend', handleTouchEnd)
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [containerRef, handleScroll, handleTouchStart, handleTouchMove, handleTouchEnd, updateScrollPosition, isTouchDevice])

  // Don't render on non-touch devices or when not visible
  if (!isTouchDevice() || !isVisible) return null

  return (
    <>
      {/* Scroll Roller */}
      <div
        ref={rollerRef}
        className={`fixed right-2 z-50 transition-all duration-300 ease-in-out ${
          isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          top: '20%',
          height: '60%',
          width: `${width}px`,
          backgroundColor: 'rgba(163, 201, 241, 0.3)',
          borderRadius: `${width / 2}px`,
          border: '1px solid rgba(163, 201, 241, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Scroll Thumb */}
        <div
          ref={thumbRef}
          className={`absolute left-0 transition-all duration-150 ease-out ${
            isDragging ? 'scale-110' : 'scale-100'
          }`}
          style={{
            top: `${scrollPercentage * 85}%`,
            width: `${width}px`,
            height: '15%',
            minHeight: '20px',
            backgroundColor: color,
            borderRadius: `${width / 2}px`,
            boxShadow: isDragging 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 2px 6px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Touch Area Indicator */}
        {isDragging && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: 'rgba(163, 201, 241, 0.1)',
              border: '2px solid rgba(163, 201, 241, 0.4)',
              animation: 'pulse 1s infinite',
            }}
          />
        )}
      </div>

      {/* Scroll Tooltip */}
      {showTooltip && tooltipText && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg transition-all duration-200"
          style={{
            right: `${width + 16}px`,
            top: `${20 + scrollPercentage * 60}%`,
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltipText}
          <div
            className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-800 transform rotate-45 -translate-y-1/2"
          />
        </div>
      )}

      {/* Quick Action Buttons */}
      {isActive && (
        <>
          {/* Jump to Top */}
          <button
            onClick={() => handleQuickSwipe('top')}
            className="fixed right-2 z-50 w-8 h-8 bg-blue-500 text-white rounded-full shadow-lg transition-all duration-200 hover:bg-blue-600 active:scale-95"
            style={{
              top: 'calc(20% - 40px)',
            }}
          >
            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>

          {/* Jump to Bottom */}
          <button
            onClick={() => handleQuickSwipe('bottom')}
            className="fixed right-2 z-50 w-8 h-8 bg-blue-500 text-white rounded-full shadow-lg transition-all duration-200 hover:bg-blue-600 active:scale-95"
            style={{
              top: 'calc(80% + 8px)',
            }}
          >
            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </>
      )}

      {/* CSS Animation for pulse effect */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  )
}

export default ScrollRoller

