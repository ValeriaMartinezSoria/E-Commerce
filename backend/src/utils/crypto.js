const crypto = require('crypto')

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const LEGACY_ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 12

function getCipherKey() {
  const secret = process.env.CARD_ENC_KEY || process.env.CARD_ENCRYPTION_KEY || 'football-ecommerce-card-key'
  return crypto.createHash('sha256').update(String(secret)).digest()
}

function encrypt(text) {
  if (!text) return ''

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getCipherKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

function decrypt(payload) {
  if (!payload) return ''

  const parts = String(payload).split(':')

  if (parts.length === 3) {
    const iv = Buffer.from(parts[0], 'base64')
    const authTag = Buffer.from(parts[1], 'base64')
    const encryptedText = Buffer.from(parts[2], 'base64')
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getCipherKey(), iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
    return decrypted.toString('utf8')
  }

  if (parts.length === 2) {
    const legacyKey = process.env.CARD_ENC_KEY || process.env.CARD_ENCRYPTION_KEY || '01234567890123456789012345678901'
    const iv = Buffer.from(parts[0], 'base64')
    const encryptedText = parts[1]
    const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, Buffer.from(legacyKey), iv)
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  return ''
}

module.exports = { encrypt, decrypt }
