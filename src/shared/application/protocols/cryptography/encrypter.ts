export interface Encrypter {
  encrypt: (plaintext: unknown) => Promise<string>
}
