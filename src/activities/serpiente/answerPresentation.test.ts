import { describe, expect, it } from 'vitest'
import { getAnswerPresentation } from './SerpienteMatematicaActivity'

describe('getAnswerPresentation', () => {
  it('marks only the solved option as correct', () => {
    expect(getAnswerPresentation({
      feedback: 'correct',
      option: 5,
      result: 5,
      selectedAnswer: 5,
      skipOnError: false,
    })).toBe('correct')
  })

  it('distinguishes the selected wrong option from the correct hint', () => {
    const shared = {
      feedback: 'wrong' as const,
      result: 5,
      selectedAnswer: 3,
      skipOnError: false,
    }

    expect(getAnswerPresentation({ ...shared, option: 3 })).toBe('wrong')
    expect(getAnswerPresentation({ ...shared, option: 5 })).toBe('hint')
    expect(getAnswerPresentation({ ...shared, option: 7 })).toBe('dimmed')
  })

  it('does not reveal the answer when the level advances after an error', () => {
    expect(getAnswerPresentation({
      feedback: 'wrong',
      option: 5,
      result: 5,
      selectedAnswer: 3,
      skipOnError: true,
    })).toBe('idle')
  })
})
