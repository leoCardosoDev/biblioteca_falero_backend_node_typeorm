// Geography Module - Public API
// This module provides location-related entities, models, services and repositories

// Domain exports
export * from './domain/entities'
export * from './domain/value-objects'
export * from './domain/gateways'
export type { AddressResolutionPolicy, AddressPolicyParams, GeoIdsDTO } from './domain/services'
export type { GeoServiceInput as GeoAddressDTO } from './domain/services'
export { ResolutionStrategy, DefaultAddressResolutionPolicy, GetOrCreateGeoEntityService } from './domain/services'

// Application exports
export * from './application/usecases'
export type {
  LoadCityByIdRepository,
  LoadStateByIdRepository,
  LoadNeighborhoodByIdRepository,
  AddNeighborhoodRepository as AddNeighborhoodProtocol
} from './application/protocols'

// Infra exports - TypeORM entities for Identity module relations
export {
  StateTypeOrmEntity,
  CityTypeOrmEntity,
  NeighborhoodTypeOrmEntity
} from './infra/db/typeorm/entities'

export * from './infra/db/typeorm/repositories'
