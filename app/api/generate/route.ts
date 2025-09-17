import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const body = await request.json()
	const deployedUrl = process.env.NEXT_PUBLIC_API_KEY

	if (!deployedUrl) {
		return NextResponse.json({ error: 'Deployed URL not configured' }, { status: 500 })
	}

	try {
		const response = await fetch(deployedUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 })
	}
}
