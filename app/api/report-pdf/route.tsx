import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { reportPayloadSchema } from '@/lib/email/report'
import { ReportDocument } from '@/lib/pdf/ReportDocument'

// Generates the actual PDF file server-side (react-pdf), replacing the
// earlier browser print-to-PDF approach. Same ReportPayload shape as the
// email report, so the two never drift on what a "full report" contains.

function fileSafe(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'report'
}

export async function POST(req: Request) {
  let parsed: ReturnType<typeof reportPayloadSchema.parse>
  try {
    parsed = reportPayloadSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const stream = await renderToStream(<ReportDocument payload={parsed} />)
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  const pdf = Buffer.concat(chunks)

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileSafe(parsed.subjectName)}-leadership-report.pdf"`,
    },
  })
}
