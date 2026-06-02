import { PLAYER_PRESETS } from '../data/config'
import type { ClaimedCell, Difficulty, Operation, Player, PlayerPreset, Roll, Shape } from '../types'

export function makePlayers(count: number, presets: PlayerPreset[] = PLAYER_PRESETS): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: presets[index].name,
    color: presets[index].color,
    shape: presets[index].shape,
    score: 0,
  }))
}

export function cellKey(row: number, col: number) {
  return `${row}-${col}`
}

function lineKey(playerId: string, cells: string[]) {
  return `${playerId}:${cells.join('|')}`
}

function getProblem(row: number, col: number, operation: Operation): Roll {
  if (operation === '+') {
    return { row, col, operation, answer: row + col, prompt: `${row} + ${col}` }
  }

  if (operation === '-') {
    return { row, col, operation, answer: row - col, prompt: `${row} - ${col}` }
  }

  if (operation === 'x') {
    return { row, col, operation, answer: row * col, prompt: `${row} x ${col}` }
  }

  return { row, col, operation, answer: row / col, prompt: `${row} / ${col}` }
}

function isValidProblem(row: number, col: number, operation: Operation) {
  if (operation === '-') {
    return row >= col
  }

  if (operation === '/') {
    return col !== 0 && row % col === 0
  }

  return true
}

export function makeRoll(difficulty: Difficulty, claimed: Record<string, ClaimedCell>): Roll | null {
  const candidates: Roll[] = []

  for (const operation of difficulty.operations) {
    for (let row = 0; row <= difficulty.maxNumber; row += 1) {
      for (let col = 0; col <= difficulty.maxNumber; col += 1) {
        if (claimed[cellKey(row, col)] || !isValidProblem(row, col, operation)) {
          continue
        }

        candidates.push(getProblem(row, col, operation))
      }
    }
  }

  if (candidates.length === 0) {
    return null
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function getLineBonuses(
  row: number,
  col: number,
  playerId: string,
  claimed: Record<string, ClaimedCell>,
  maxNumber: number,
  awardedLines: Set<string>,
) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]
  const bonuses: string[] = []

  for (const [dr, dc] of directions) {
    for (let offset = -2; offset <= 0; offset += 1) {
      const cells = Array.from({ length: 3 }, (_, index) => {
        const nextRow = row + (offset + index) * dr
        const nextCol = col + (offset + index) * dc
        return { row: nextRow, col: nextCol, key: cellKey(nextRow, nextCol) }
      })

      const isInside = cells.every(
        (cell) =>
          cell.row >= 0 &&
          cell.row <= maxNumber &&
          cell.col >= 0 &&
          cell.col <= maxNumber,
      )
      if (!isInside) {
        continue
      }

      const allOwned = cells.every((cell) => claimed[cell.key]?.playerId === playerId)
      const bonusKey = lineKey(playerId, cells.map((cell) => cell.key))
      if (allOwned && !awardedLines.has(bonusKey)) {
        bonuses.push(bonusKey)
      }
    }
  }

  return bonuses
}

export function shapeSymbol(shape: Shape) {
  const symbols: Record<Shape, string> = {
    circle: '●',
    star: '★',
    heart: '♥',
    triangle: '▲',
    diamond: '◆',
  }

  return symbols[shape]
}
