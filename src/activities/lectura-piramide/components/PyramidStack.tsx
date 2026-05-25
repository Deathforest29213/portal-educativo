import type { Minihistory } from '../types'
import type { CSSProperties } from 'react'
import { getLineParts, getLineWidth } from '../utils/pyramid'

type FitCase = 'normal' | 'tight' | 'compact' | 'compressed' | 'smallest'

interface PyramidStackProps {
  story: Minihistory
  visibleCount?: number
  mode?: 'reading' | 'summary' | 'print'
}

export function PyramidStack({
  story,
  visibleCount = story.lines.length,
  mode = 'reading',
}: PyramidStackProps) {
  const visibleLines = story.lines.slice(0, visibleCount)

  return (
    <div className={mode === 'summary' ? 'summary-stack' : mode === 'print' ? 'print-stack' : 'pyramid'}>
      {visibleLines.map((item, index) => {
        const parts = getLineParts(story.lines, index)
        const isActive = index === visibleLines.length - 1
        const width = getLineWidth(story.lines.length, index)
        const fitCase = getLineFitCase(item.text, width)
        const fontSize = getLineFontSize(fitCase, mode)

        return (
          <div
            key={`${story.id}-line-${index}`}
            data-fit={fitCase}
            className={
              mode === 'summary'
                ? 'summary-line'
                : mode === 'print'
                  ? 'print-line'
                : `pyramid-line ${isActive ? 'active' : ''}`
            }
            style={
              mode === 'summary'
                ? ({
                    '--summary-width': width,
                    '--summary-font-size': fontSize,
                  } as CSSProperties)
                : mode === 'print'
                  ? ({
                      '--print-width': width,
                      '--print-font-size': fontSize,
                    } as CSSProperties)
                : ({
                    '--line-width': width,
                    '--line-font-size': fontSize,
                  } as CSSProperties)
            }
          >
            {parts.prefix ? (
              <>
                <span className="prefix">{parts.prefix}</span>
                {parts.suffix ? <span className="suffix"> {parts.suffix}</span> : null}
              </>
            ) : (
              item.text
            )}
          </div>
        )
      })}
    </div>
  )
}

function getLineFitCase(text: string, width: string): FitCase {
  const widthPercent = Number.parseFloat(width)
  const usableWidth = Number.isFinite(widthPercent) && widthPercent > 0 ? widthPercent : 100
  const density = getTextUnits(text) / usableWidth

  if (density > 0.6) return 'smallest'
  if (density > 0.54) return 'compressed'
  if (density > 0.48) return 'compact'
  if (density > 0.4) return 'tight'
  return 'normal'
}

function getTextUnits(text: string) {
  return text.trim().replace(/\s+/g, ' ').length
}

function getLineFontSize(fitCase: FitCase, mode: 'reading' | 'summary' | 'print') {
  if (mode === 'summary') {
    const sizes: Record<FitCase, string> = {
      normal: '0.98rem',
      tight: '0.92rem',
      compact: '0.86rem',
      compressed: '0.8rem',
      smallest: '0.74rem',
    }

    return sizes[fitCase]
  }

  if (mode === 'print') {
    const sizes: Record<FitCase, string> = {
      normal: '1.34rem',
      tight: '1.24rem',
      compact: '1.14rem',
      compressed: '1.04rem',
      smallest: '0.94rem',
    }

    return sizes[fitCase]
  }

  const sizes: Record<FitCase, string> = {
    normal: '1.28rem',
    tight: '1.2rem',
    compact: '1.1rem',
    compressed: '1rem',
    smallest: '0.88rem',
  }

  return sizes[fitCase]
}
