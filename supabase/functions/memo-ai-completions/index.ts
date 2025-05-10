// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  const { memo_type, user_memo, user_tags } = await req.json()
  
  const apiKey = Deno.env.get("GEMINI_API_KEY")
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [
          {
            text: `
あなたは、AIプログラミングメモ帳というwebアプリに組み込まれたAIです。このアプリでは、ユーザーが入力したメモやコードをもとに、AIがタイトル、解説、タグを生成します。

#入力情報
##メモの種類:
${memo_type}
## ユーザー入力内容:
${user_memo}
## ユーザー指定タグ (存在する場合):
${JSON.stringify(user_tags)}

# 指示
1.  **タイトルの生成**:
    *   ユーザー入力内容を最もよく表す簡潔なタイトルを1つ生成してください（メモの内容がパッとわかるタイトル）。
    *   最大30文字程度でお願いします。

2.  **解説の生成**:
    *   メモの種類が「${memo_type}」であることを踏まえ、ユーザー入力内容について、その要点、目的、背景、または（コードの場合）機能や簡単な使用方法などを分かりやすく解説してください。
    *   ${memo_type}が"code"の場合は、コードの言語を推測し、適切なマークダウン（コードブロックなど）を使用して解説してください。
    *   300文字程度でお願いします。

3.  **タグの生成**:
    *   ユーザー入力内容と生成した解説に基づいて、関連性の高いキーワードタグを最大で5個提案してください。
    *   ユーザー指定タグが存在する場合は、それらと重複せず、かつ関連性の高いタグを選んでください。
    *   タグはJSON配列形式（例: ["タグ1", "タグ2", "タグ3"]）で出力してください。

# 出力形式
必ず以下のJSON形式で応答してください。
\`\`\`json
{
  "title": "{生成されたタイトル}",
  "explanation": "{生成された解説}",
  "ai_tags": {生成されたタグのJSON配列}
}
\`\`\`
`
          }
        ]
      }
    ]
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })

  const data = await response.json()

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } }
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/memo-ai-completions' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
