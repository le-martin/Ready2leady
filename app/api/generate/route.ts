import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { nativeLang, targetLang, genreLabels, keywords } = await req.json()

    const kw = keywords?.length ? `Keywords to include: ${keywords.join(', ')}` : ''
    const multiNote = genreLabels.includes(',')
      ? `Blend these genres naturally: ${genreLabels}`
      : `Genre: ${genreLabels}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `You are a language learning story generator. Respond with ONLY valid JSON, no markdown, no code blocks, no explanation.

Create a short language learning story with this exact JSON structure:
{
  "title": "story title in ${targetLang}",
  "titleTr": "title translation in ${nativeLang}",
  "level": "초급",
  "genreLabel": "${genreLabels}",
  "paragraphs": [
    {
      "sentences": [
        {"text": "sentence in ${targetLang}", "tr": "translation in ${nativeLang}"}
      ],
      "words": [
        {"word": "key word", "pron": "pronunciation/romanization", "meaning": "meaning in ${nativeLang}", "example": "${targetLang} example — ${nativeLang} translation"}
      ]
    }
  ]
}

Requirements:
- ${multiNote}
- ${kw}
- Story language: ${targetLang}
- Reader native language: ${nativeLang}
- Exactly 5 paragraphs, each with exactly 4 sentences
- Each paragraph: 3-4 key vocabulary words
- Simple sentences for beginner learners
- ONLY output JSON`

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
