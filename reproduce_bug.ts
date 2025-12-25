
import crypto from 'crypto'

async function checkHashing() {
  console.log('--- Consistency Check Start ---')

  // 1. Simulate Generation (DbAuthentication)
  const refreshToken = crypto.randomBytes(32).toString('hex')
  console.log(`[Generated] Token: ${refreshToken}`)
  console.log(`[Generated] Length: ${refreshToken.length}`)

  // 2. Simulate Hashing (Sha256Adapter)
  const hash1 = crypto.createHash('sha256').update(refreshToken).digest('hex')
  console.log(`[Hashed-1] Digest: ${hash1}`)

  // 3. Simulate Verification (DbRefreshToken)
  // Input: the EXACT same string from step 1
  const incomingToken = refreshToken
  const hash2 = crypto.createHash('sha256').update(incomingToken).digest('hex')
  console.log(`[Hashed-2] Digest: ${hash2}`)

  // 4. Compare
  if (hash1 === hash2) {
    console.log('✅ PASS: Hashes match.')
  } else {
    console.log('❌ FAIL: Hashes DO NOT match!')
    console.log(`Hash1: ${hash1}`)
    console.log(`Hash2: ${hash2}`)
  }
}

checkHashing().catch(console.error)
