import { Branded } from '@/domain/types/branded'

export type UserId = Branded<string, 'UserId'>
export type LoginId = Branded<string, 'LoginId'>
export type SessionId = Branded<string, 'SessionId'>
export type AccountId = Branded<string, 'AccountId'>
