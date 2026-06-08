const crypto = require('crypto')

const ALGORITHM = 'aes-256-cbc'
const KEY = process.env.CARD_ENC_KEY || '01234567890123456789012345678901' // 32 bytes
const IV_LENGTH = 16

function encrypt(text) {
  if (!text) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv)
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return iv.toString('base64') + ':' + encrypted
}

function decrypt(payload) {
  if (!payload) return ''
  const parts = payload.split(':')
  const iv = Buffer.from(parts[0], 'base64')
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv)
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

module.exports = { encrypt, decrypt }
