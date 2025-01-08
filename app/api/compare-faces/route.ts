import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { image1, image2 } = await req.json()

  await new Promise(resolve => setTimeout(resolve, 2000))

  const result = {
    croppedFace1: '/placeholder.svg?height=150&width=150',
    croppedFace2: '/placeholder.svg?height=150&width=150',
    matchingConfidence: Math.random()
  }

  return NextResponse.json(result)
}

