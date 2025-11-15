import { useCallback, useMemo, useRef, useState } from "react"
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"

interface UseSwipeableItemOptions {
  revealThreshold?: number
  revealOffset?: number
  minOffset?: number
}

type SwipeableBind = {
  onMouseDown: (event: ReactMouseEvent) => void
  onMouseMove: (event: ReactMouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  onTouchStart: (event: ReactTouchEvent) => void
  onTouchMove: (event: ReactTouchEvent) => void
  onTouchEnd: () => void
}

export const useSwipeableItem = (
  options: UseSwipeableItemOptions = {},
) => {
  const {
    revealThreshold = 56,
    revealOffset = -96,
    minOffset = -140,
  } = options

  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const startXRef = useRef<number | null>(null)
  const startOffsetRef = useRef(0)
  const hasSwipedRef = useRef(false)

  const completeGesture = useCallback(
    (currentOffset: number) => {
      const shouldReveal = currentOffset <= -revealThreshold
      if (shouldReveal) {
        setIsRevealed(true)
        return revealOffset
      }
      setIsRevealed(false)
      hasSwipedRef.current = false
      return 0
    },
    [revealOffset, revealThreshold],
  )

  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true)
    startXRef.current = clientX
    startOffsetRef.current = offset
  }, [offset])

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || startXRef.current === null) {
        return
      }
      const delta = clientX - startXRef.current
      if (Math.abs(delta) > 4) {
        hasSwipedRef.current = true
      }
      let nextOffset = startOffsetRef.current + delta
      nextOffset = Math.min(0, Math.max(minOffset, nextOffset))
      setOffset(nextOffset)
    },
    [isDragging, minOffset],
  )

  const handleEnd = useCallback(() => {
    if (!isDragging) {
      return
    }
    setIsDragging(false)
    startXRef.current = null
    startOffsetRef.current = 0
    setOffset((current) => completeGesture(current))
  }, [completeGesture, isDragging])

  const bind: SwipeableBind = useMemo(
    () => ({
      onMouseDown: (event: ReactMouseEvent) => handleStart(event.clientX),
      onMouseMove: (event: ReactMouseEvent) => handleMove(event.clientX),
      onMouseUp: () => handleEnd(),
      onMouseLeave: () => isDragging && handleEnd(),
      onTouchStart: (event: ReactTouchEvent) =>
        handleStart(event.touches[0].clientX),
      onTouchMove: (event: ReactTouchEvent) =>
        handleMove(event.touches[0].clientX),
      onTouchEnd: () => handleEnd(),
    }),
    [handleEnd, handleMove, handleStart, isDragging],
  )

  const shouldBlockClick = useCallback(() => {
    if (isDragging || isRevealed || hasSwipedRef.current) {
      hasSwipedRef.current = false
      return true
    }
    return false
  }, [isDragging, isRevealed])

  const resetSwipeState = useCallback(() => {
    setOffset(0)
    setIsRevealed(false)
    setIsDragging(false)
    startXRef.current = null
    startOffsetRef.current = 0
    hasSwipedRef.current = false
  }, [])

  const showDeleteAction = useMemo(
    () => isRevealed || Math.abs(offset) > 0,
    [isRevealed, offset],
  )

  return {
    bind,
    offset,
    isRevealed,
    showDeleteAction,
    resetSwipeState,
    shouldBlockClick,
  }
}
