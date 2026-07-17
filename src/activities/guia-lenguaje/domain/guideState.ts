import type { TaskKey } from '../data/content'

export type GuideStage = 'menu' | 'task1' | 'task2' | 'task3' | 'results'
export type GuideFeedback = boolean | null
export type GuideSelection = TaskKey | 'all' | null
export type FragmentSelection = { id: string; text: string }

export type TaskResult = {
  answer: string
  correct: boolean
  id: string
  label: string
  maxPoints: number
  points: number
  selected: string
}

export type ResultsState = Record<TaskKey, TaskResult[]>

export type GuideState = {
  stage: GuideStage
  sequence: TaskKey[]
  selection: GuideSelection
  results: ResultsState
  task1Mode: 'reading' | 'quiz'
  task1Part: number
  task1Question: number
  task1Selected: string
  task1Feedback: GuideFeedback
  task2Question: number
  task2Selected: FragmentSelection[]
  task2Feedback: GuideFeedback
  task2Choices: string[][]
  task3Question: number
  task3Selected: string
  task3Feedback: GuideFeedback
}

export type GuideCommand =
  | { type: 'RESET'; stage: GuideStage; sequence: TaskKey[]; selection: GuideSelection; task2Choices: string[][] }
  | { type: 'SET_STAGE'; stage: GuideStage }
  | { type: 'REGISTER_RESULT'; task: TaskKey; result: TaskResult }
  | { type: 'BACK_TO_TASK1_READING'; lastPart: number }
  | { type: 'SET_TASK1_MODE'; mode: 'reading' | 'quiz' }
  | { type: 'SET_TASK1_PART'; index: number }
  | { type: 'SET_TASK1_QUESTION'; index: number }
  | { type: 'SET_TASK1_SELECTED'; selected: string }
  | { type: 'SET_TASK1_FEEDBACK'; feedback: GuideFeedback }
  | { type: 'SET_TASK2_QUESTION'; index: number }
  | { type: 'SET_TASK2_SELECTED'; selected: FragmentSelection[] }
  | { type: 'SET_TASK2_FEEDBACK'; feedback: GuideFeedback }
  | { type: 'SET_TASK3_QUESTION'; index: number }
  | { type: 'SET_TASK3_SELECTED'; selected: string }
  | { type: 'SET_TASK3_FEEDBACK'; feedback: GuideFeedback }

export function createGuideState(task2Choices: string[][]): GuideState {
  return {
    stage: 'menu',
    sequence: [],
    selection: null,
    results: emptyResults(),
    task1Mode: 'reading',
    task1Part: 0,
    task1Question: 0,
    task1Selected: '',
    task1Feedback: null,
    task2Question: 0,
    task2Selected: [],
    task2Feedback: null,
    task2Choices,
    task3Question: 0,
    task3Selected: '',
    task3Feedback: null,
  }
}

export function guideReducer(state: GuideState, command: GuideCommand): GuideState {
  switch (command.type) {
    case 'RESET':
      return {
        ...createGuideState(command.task2Choices),
        stage: command.stage,
        sequence: command.sequence,
        selection: command.selection,
      }
    case 'SET_STAGE':
      return { ...state, stage: command.stage }
    case 'REGISTER_RESULT':
      return {
        ...state,
        results: {
          ...state.results,
          [command.task]: [...state.results[command.task], command.result],
        },
      }
    case 'BACK_TO_TASK1_READING':
      return {
        ...state,
        task1Mode: 'reading',
        task1Part: command.lastPart,
        task1Question: 0,
        task1Selected: '',
        task1Feedback: null,
        results: { ...state.results, task1: [] },
      }
    case 'SET_TASK1_MODE': return { ...state, task1Mode: command.mode }
    case 'SET_TASK1_PART': return { ...state, task1Part: command.index }
    case 'SET_TASK1_QUESTION': return { ...state, task1Question: command.index }
    case 'SET_TASK1_SELECTED': return { ...state, task1Selected: command.selected }
    case 'SET_TASK1_FEEDBACK': return { ...state, task1Feedback: command.feedback }
    case 'SET_TASK2_QUESTION': return { ...state, task2Question: command.index }
    case 'SET_TASK2_SELECTED': return { ...state, task2Selected: command.selected }
    case 'SET_TASK2_FEEDBACK': return { ...state, task2Feedback: command.feedback }
    case 'SET_TASK3_QUESTION': return { ...state, task3Question: command.index }
    case 'SET_TASK3_SELECTED': return { ...state, task3Selected: command.selected }
    case 'SET_TASK3_FEEDBACK': return { ...state, task3Feedback: command.feedback }
    default: return state
  }
}

export function getResultTaskKeys(selection: GuideSelection): TaskKey[] {
  if (selection === 'all') return ['task1', 'task2', 'task3']
  return selection ? [selection] : []
}

function emptyResults(): ResultsState {
  return { task1: [], task2: [], task3: [] }
}
