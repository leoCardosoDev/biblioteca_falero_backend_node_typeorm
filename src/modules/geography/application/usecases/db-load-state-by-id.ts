import { LoadStateById } from '@/modules/geography/application/usecases/load-state-by-id'
import { LoadStateByIdRepository } from '@/modules/geography/application/protocols/db/state/load-state-by-id-repository'
import { StateModel } from '@/modules/geography/domain/models/state'

export class DbLoadStateById implements LoadStateById {
  constructor(private readonly loadStateByIdRepository: LoadStateByIdRepository) { }

  async load(id: string): Promise<StateModel | undefined> {
    return await this.loadStateByIdRepository.loadById(id)
  }
}
