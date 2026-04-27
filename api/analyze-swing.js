/* global process */

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function normalizePriority(value, fallback = 3) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(5, Math.max(1, Math.round(number)));
}

function normalizeAnalysis(raw = {}) {
  const priorities = raw.priorities || {};
  return {
    swing: ['느림', '보통', '빠름', '매우 빠름'].includes(raw.swing) ? raw.swing : '보통',
    play_style: raw.play_style || '올라운더',
    confidence: raw.confidence || '보통',
    summary: raw.summary || '영상에서 확인되는 스윙 템포와 임팩트 성향을 기준으로 추천 입력값을 조정했습니다.',
    recommendation_note: raw.recommendation_note || '',
    observations: Array.isArray(raw.observations) ? raw.observations.slice(0, 4) : [],
    priorities: {
      spin: normalizePriority(priorities.spin, 3),
      power: normalizePriority(priorities.power, 3),
      control: normalizePriority(priorities.control, 4),
      comfort: normalizePriority(priorities.comfort, 3),
    },
    swing_path: raw.swing_path || '',
    contact_timing: raw.contact_timing || '',
    spin_profile: raw.spin_profile || '',
  };
}

function buildSwingPrompt() {
  return `테니스 코치이자 스트링 피터처럼 영상 프레임을 분석해 주세요.

목표:
- 스윙 속도, 스윙 궤도, 임팩트 성향을 추정합니다.
- 스트링 추천 폼에 바로 반영할 값을 JSON으로 반환합니다.
- 영상만으로 판단하기 어려운 부분은 confidence를 낮추고 관찰 가능한 내용만 말합니다.

선택지는 정확히 아래 값 중 하나를 사용하세요.
- swing: "느림" | "보통" | "빠름" | "매우 빠름"
- play_style: "올라운더" | "베이스라이너 (수비형)" | "공격형 베이스라이너" | "서브앤발리 / 네트플레이어" | "스핀 위주" | "플랫 위주"
- priorities 값은 각각 1~5 정수

반환 형식:
{
  "swing": "빠름",
  "play_style": "스핀 위주",
  "confidence": "낮음|보통|높음",
  "summary": "1~2문장 한국어 요약",
  "recommendation_note": "스트링 추천에 반영할 짧은 메모",
  "observations": ["관찰 1", "관찰 2", "관찰 3"],
  "priorities": { "spin": 4, "power": 3, "control": 4, "comfort": 3 },
  "swing_path": "low-to-high|flat|compact|unknown",
  "contact_timing": "early|neutral|late|unknown",
  "spin_profile": "heavy|moderate|flat|unknown"
}`;
}

async function analyzeWithGemini(frames) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되어 있지 않습니다.');
  }

  const parts = [
    { text: buildSwingPrompt() },
    ...frames.map((frame) => ({
      inline_data: {
        mime_type: 'image/jpeg',
        data: frame,
      },
    })),
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini 분석 요청 실패: ${detail.slice(0, 160)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('스윙 분석 응답이 비어 있습니다.');

  const parsed = parseJson(text);
  if (!parsed) throw new Error('스윙 분석 응답을 해석하지 못했습니다.');
  return normalizeAnalysis(parsed);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const frames = Array.isArray(req.body?.frames) ? req.body.frames : [];
    const safeFrames = frames
      .filter((frame) => typeof frame === 'string' && frame.length > 1000)
      .slice(0, 6);

    if (!safeFrames.length) {
      res.status(400).json({ error: '분석할 영상 프레임이 없습니다.' });
      return;
    }

    const analysis = await analyzeWithGemini(safeFrames);
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('swing analysis api error:', error);
    res.status(500).json({ error: error.message || '스윙 분석 중 오류가 발생했습니다.' });
  }
}
