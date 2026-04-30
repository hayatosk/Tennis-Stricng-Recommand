/* global process */

import { analyzeCurrentString, getRuleBasedRecommendations } from '../lib/recommend.js';

function buildPrompt(form, currentAnalysis, recommendations) {
  return `너는 테니스 스트링 전문가다. 이미 계산된 추천 결과를 더 읽기 쉽게 한국어로 다듬어라.

규칙:
- 순위는 유지한다.
- 존재하지 않는 스트링/스펙을 지어내지 않는다.
- 각 추천의 reason만 2문장 이내로 자연스럽게 다듬는다.
- vs_current가 객체이면 summary, advantages, cautions 구조를 유지하고 문장만 자연스럽게 다듬는다.
- hybrid_combo가 객체이면 position, full_bed, as_main, as_cross, recommendation 구조를 유지한다.
- 하이브리드 설명은 추천 스트링을 메인에 쓸 때와 크로스에 쓸 때를 구분하고, 메인 사용 시 어울리는 크로스 스트링 후보를 유지한다.
- JSON만 반환한다.

플레이어 입력:
${JSON.stringify(form, null, 2)}

현재 스트링 분석:
${JSON.stringify(currentAnalysis, null, 2)}

추천 후보:
${JSON.stringify(recommendations, null, 2)}

반환 형식:
{"current_analysis": { ... } | null, "recommendations": [ ... ]}`;
}

async function enhanceWithAI(form, currentAnalysis, recommendations) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { current_analysis: currentAnalysis, recommendations };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildPrompt(form, currentAnalysis, recommendations) }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2200,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) return { current_analysis: currentAnalysis, recommendations };
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return { current_analysis: currentAnalysis, recommendations };

  try {
    console.log('recommend request body:', form);
    return JSON.parse(text);
  } catch {
    return { current_analysis: currentAnalysis, recommendations };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const form = req.body;
    const current_analysis = analyzeCurrentString(form);
    const recommendations = getRuleBasedRecommendations(form);
    const enhanced = await enhanceWithAI(form, current_analysis, recommendations);

    res.status(200).json({
      current_analysis: enhanced.current_analysis ?? current_analysis,
      recommendations: Array.isArray(enhanced.recommendations) ? enhanced.recommendations.slice(0, 5) : recommendations,
    });
  } catch (error) {
    console.error('recommend api error:', error);
    res.status(500).json({ error: error.message || '추천 처리 중 오류가 발생했습니다.' });
  }
}
