import { Router } from 'express'
import { adaptRoute } from '@/main/adapters/express-route-adapter'
import { makeAddUserController } from '@/main/factories/add-user-controller-factory'

export default (router: Router): void => {
  router.post('/signup', adaptRoute(makeAddUserController()))
}
