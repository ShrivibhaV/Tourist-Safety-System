// QR Code generation utilities for Digital Tourist IDs

export interface QRCodeData {
  touristId: string
  digitalId: string
  name: string
  nationality: string
  emergencyContact: string
  verificationHash: string
  timestamp: number
}

export class QRCodeGenerator {
  // Generate QR code data object
  static generateQRData(tourist: any, blockchainHash: string): QRCodeData {
    return {
      touristId: tourist.id,
      digitalId: tourist.digitalId,
      name: `${tourist.firstName} ${tourist.lastName}`,
      nationality: tourist.nationality,
      emergencyContact: tourist.emergencyContactPhone,
      verificationHash: blockchainHash,
      timestamp: Date.now(),
    }
  }

  // Generate SVG QR code (simplified version for demo)
  static generateQRCodeSVG(data: QRCodeData, size = 200): string {
    const qrData = JSON.stringify(data)
    const hash = this.simpleHash(qrData)

    // Generate a simple pattern based on the hash
    const pattern = this.generatePattern(hash, 21) // 21x21 grid

    const cellSize = size / 21
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${size}" height="${size}" fill="white"/>`

    // Draw the pattern
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        if (pattern[row][col]) {
          const x = col * cellSize
          const y = row * cellSize
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`
        }
      }
    }

    // Add finder patterns (corners)
    svg += this.addFinderPattern(0, 0, cellSize)
    svg += this.addFinderPattern(14 * cellSize, 0, cellSize)
    svg += this.addFinderPattern(0, 14 * cellSize, cellSize)

    svg += "</svg>"
    return svg
  }

  // Generate data URL for QR code
  static generateQRCodeDataURL(data: QRCodeData, size = 200): string {
    const svg = this.generateQRCodeSVG(data, size)
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }

  // Simple hash function for demo purposes
  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Generate a pattern based on hash
  private static generatePattern(hash: number, size: number): boolean[][] {
    const pattern: boolean[][] = []
    let currentHash = hash

    for (let row = 0; row < size; row++) {
      pattern[row] = []
      for (let col = 0; col < size; col++) {
        // Skip finder pattern areas
        if (this.isFinderPatternArea(row, col)) {
          pattern[row][col] = false
          continue
        }

        currentHash = (currentHash * 1103515245 + 12345) & 0x7fffffff
        pattern[row][col] = currentHash % 2 === 1
      }
    }

    return pattern
  }

  // Check if position is in finder pattern area
  private static isFinderPatternArea(row: number, col: number): boolean {
    // Top-left finder pattern
    if (row < 9 && col < 9) return true
    // Top-right finder pattern
    if (row < 9 && col > 11) return true
    // Bottom-left finder pattern
    if (row > 11 && col < 9) return true

    return false
  }

  // Add finder pattern to SVG
  private static addFinderPattern(x: number, y: number, cellSize: number): string {
    let pattern = ""

    // Outer 7x7 square
    pattern += `<rect x="${x}" y="${y}" width="${7 * cellSize}" height="${7 * cellSize}" fill="black"/>`
    // Inner 5x5 white square
    pattern += `<rect x="${x + cellSize}" y="${y + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="white"/>`
    // Center 3x3 black square
    pattern += `<rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="black"/>`

    return pattern
  }

  // Verify QR code data
  static verifyQRData(qrDataString: string): boolean {
    try {
      const data = JSON.parse(qrDataString) as QRCodeData

      // Check required fields
      if (!data.touristId || !data.digitalId || !data.verificationHash) {
        return false
      }

      // Check timestamp (not older than 1 year)
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
      if (data.timestamp < oneYearAgo) {
        return false
      }

      return true
    } catch {
      return false
    }
  }
}
