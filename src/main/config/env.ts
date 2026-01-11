import 'dotenv/config'

export default {
  mysqlHost: process.env.MYSQL_HOST ?? 'localhost',
  mysqlPort: parseInt(process.env.MYSQL_PORT ?? '3306'),
  mysqlUser: process.env.MYSQL_USER ?? 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD ?? 'root',
  mysqlDb: process.env.MYSQL_DATABASE ?? 'biblioteca',
  port: process.env.PORT ?? 5050,
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET ?? 'secret'
}
