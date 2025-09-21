// test/server/api/getUser.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch } from 'ofetch'

describe('API endpoints', () => {
  it('should return user data', async () => {
    const response = await $fetch('/api/user/68c8b0a1c1bc035067c4aaf4', {
      baseURL: 'http://localhost:3000'
    })

    expect(response).toHaveProperty('user.email')
    expect(response).toHaveProperty('user.password')
    expect(response).toHaveProperty('user.role')
    expect(response).toHaveProperty('user.active')
  })
})