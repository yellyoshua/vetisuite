import type { Visit, VisitAdvanceInput, VisitBoard, VisitBoardQuery } from './visits.schema'

const visitsService = {
  board(_query: VisitBoardQuery): Promise<VisitBoard> {
    throw new Error('Not implemented: visitsService.board')
  },
  advance(_input: VisitAdvanceInput): Promise<Visit> {
    throw new Error('Not implemented: visitsService.advance')
  },
}

export default visitsService
