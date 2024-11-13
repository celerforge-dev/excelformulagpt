import * as React from "react"
import { useEffect, useRef } from "react"

export default function useHighlight(
  highlightRef: React.RefObject<HTMLDivElement>,
  direction: "x" | "y" = "x",
  setAsDefault: boolean = false
) {
  const targetRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    function setHighlightPosition() {
      if (!targetRef.current) return
      if (direction === "x") {
        highlightRef?.current?.style.setProperty(
          "transform",
          `translateX(${targetRef.current.offsetLeft}px)`
        )
        highlightRef?.current?.style.setProperty(
          "width",
          `${targetRef.current.offsetWidth}px`
        )
      } else {
        highlightRef?.current?.style.setProperty(
          "transform",
          `translateY(${targetRef.current.offsetTop}px)`
        )
        highlightRef?.current?.style.setProperty(
          "height",
          `${targetRef.current.offsetHeight}px`
        )
      }
    }
    function handleMouseEnter() {
      setHighlightPosition()
      highlightRef?.current?.style.setProperty("opacity", "1")
    }
    function handleMouseLeave() {
      highlightRef?.current?.style.setProperty("opacity", "0")
    }

    if (targetRef.current) {
      if (setAsDefault) {
        setHighlightPosition()
      }

      targetRef.current.addEventListener("mouseenter", handleMouseEnter)
      targetRef.current.addEventListener("mouseleave", handleMouseLeave)
    }
    const refValue = targetRef.current
    return () => {
      if (refValue) {
        refValue.removeEventListener("mouseenter", handleMouseEnter)
        refValue.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [highlightRef, targetRef, direction, setAsDefault])
  return targetRef
}
