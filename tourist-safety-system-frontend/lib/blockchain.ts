// Blockchain integration utilities for Digital Tourist ID

export interface BlockchainTransaction {
  hash: string
  timestamp: number
  touristId: string
  data: Record<string, any>
  verified: boolean
}

export class BlockchainService {
  private static instance: BlockchainService
  private transactions: Map<string, BlockchainTransaction> = new Map()

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService()
    }
    return BlockchainService.instance
  }

  // Generate a secure hash for the tourist ID
  async generateHash(touristData: Record<string, any>): Promise<string> {
    const dataString = JSON.stringify(touristData)
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString + Date.now())

    // Use Web Crypto API for hashing
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    return `0x${hashHex}`
  }

  // Record a new tourist ID on the blockchain
  async recordTouristId(touristId: string, touristData: Record<string, any>): Promise<BlockchainTransaction> {
    const hash = await this.generateHash(touristData)

    const transaction: BlockchainTransaction = {
      hash,
      timestamp: Date.now(),
      touristId,
      data: touristData,
      verified: true,
    }

    this.transactions.set(touristId, transaction)

    // In a real implementation, this would interact with an actual blockchain
    console.log(`[Blockchain] Tourist ID ${touristId} recorded with hash: ${hash}`)

    return transaction
  }

  // Verify a tourist ID against the blockchain
  async verifyTouristId(touristId: string): Promise<boolean> {
    const transaction = this.transactions.get(touristId)
    return transaction ? transaction.verified : false
  }

  // Get blockchain transaction for a tourist ID
  async getTransaction(touristId: string): Promise<BlockchainTransaction | null> {
    return this.transactions.get(touristId) || null
  }

  // Update tourist data on blockchain (creates new transaction)
  async updateTouristData(touristId: string, updatedData: Record<string, any>): Promise<BlockchainTransaction> {
    const existingTransaction = this.transactions.get(touristId)
    if (!existingTransaction) {
      throw new Error("Tourist ID not found on blockchain")
    }

    const mergedData = { ...existingTransaction.data, ...updatedData }
    return this.recordTouristId(touristId, mergedData)
  }

  // Generate a unique digital ID
  generateDigitalId(): string {
    const year = new Date().getFullYear()
    const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `TST-${year}-${randomPart}`
  }

  // Validate digital ID format
  validateDigitalId(digitalId: string): boolean {
    const pattern = /^TST-\d{4}-[A-Z0-9]{6}$/
    return pattern.test(digitalId)
  }
}

// Export singleton instance
export const blockchainService = BlockchainService.getInstance()
