import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { word, targetLang, nativeLang } = await req.json()

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `Respond with ONLY valid JSON, no markdown, no code blocks.

Return JSON for the word "${word}" in ${targetLang}:
{"word":"${word}","pron":"pronunciation/romanization","meaning":"meaning in ${nativeLang}","example":"${targetLang} example sentence — ${nativeLang} translation"}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text()

    const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
    const jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : raw
    const parsed = JSON.parse(jsonStr)

    return NextResponse.json(parsed)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
