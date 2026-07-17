import { describe, expect, it } from 'vitest'
import { task1Parts, task1Questions } from './content'

describe('imágenes de Las cartas de Teodoro', () => {
  it('asocia las preguntas sobre el barrio con la escena de reparto', () => {
    expect(task1Questions.slice(0, 3).every((question) => question.image === task1Parts[1].image)).toBe(true)
  })

  it('asocia la pregunta sobre escribir cartas con Teodoro escribiendo', () => {
    expect(task1Questions[3].image).toBe(task1Parts[2].image)
    expect(task1Questions.every((question) => question.imageAlt.length > 0)).toBe(true)
  })
})
