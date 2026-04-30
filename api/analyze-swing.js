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

function normalizeEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizeAnalysis(raw = {}) {
  const priorities = raw.priorities || {};
  const strokeType = normalizeEnum(raw.stroke_type, ['forehand', 'backhand', 'serve', 'volley', 'unknown'], 'unknown');
  const strokeLabel = {
    forehand: '포핸드',
    backhand: '백핸드',
    serve: '서브',
    volley: '발리',
    unknown: '판단 불가',
  }[strokeType];

  return {
    stroke_type: strokeType,
    stroke_label: raw.stroke_label || strokeLabel,
    handedness: normalizeEnum(raw.handedness, ['right-handed', 'left-handed', 'unknown'], 'unknown'),
    stroke_confidence: raw.stroke_confidence || raw.confidence || '보통',
    swing: normalizeEnum(raw.swing, ['느림', '보통', '빠름', '매우 빠름'], '보통'),
    play_style: raw.play_style || '올라운더',
    confidence: raw.confidence || '보통',
    summary: raw.summary || '영상에서 확인되는 스트로크 종류, 스윙 템포와 임팩트 성향을 기준으로 추천 입력값을 조정했습니다.',
    recommendation_note: raw.recommendation_note || '',
    observations: Array.isArray(raw.observations) ? raw.observations.slice(0, 5) : [],
    priorities: {
      spin: normalizePriority(priorities.spin, 3),
      power: normalizePriority(priorities.power, 3),
      control: normalizePriority(priorities.control, 4),
      comfort: normalizePriority(priorities.comfort, 3),
    },
    swing_path: raw.swing_path || 'unknown',
    contact_timing: raw.contact_timing || 'unknown',
    spin_profile: raw.spin_profile || 'unknown',
  };
}

function buildSwingPrompt() {
  return `테니스 코치이자 스트링 피터처럼 영상 프레임을 분석해 주세요.

가장 중요한 1단계:
- 먼저 이 영상이 포핸드인지 백핸드인지 판단하세요.
- 포핸드/백핸드 판단은 라켓을 든 손, 몸통 회전 방향, 임팩트 지점, 팔이 몸의 어느 쪽에서 지나가는지, 팔로스루 방향을 함께 보고 결정하세요.
- 카메라가 반전되어 보일 수 있으므로 오른손/왼손만으로 단정하지 마세요.
- 한 손 백핸드와 양손 백핸드도 모두 backhand로 분류하세요.
- 포핸드 스트로크로 보이면 반드시 stroke_type을 "forehand"로 반환하세요.
- 확실하지 않으면 backhand로 추정하지 말고 "unknown"을 반환하고 confidence를 낮추세요.

분석 목표:
- 스트로크 종류, 스윙 속도, 스윙 궤도, 임팩트 타이밍, 스핀 성향을 추정합니다.
- 스트링 추천 폼에 바로 반영할 값을 JSON으로 반환합니다.
- 영상만으로 판단하기 어려운 부분은 confidence를 낮추고 관찰 가능한 내용만 말합니다.

선택지는 정확히 아래 값 중 하나를 사용하세요.
- stroke_type: "forehand" | "backhand" | "serve" | "volley" | "unknown"
- handedness: "right-handed" | "left-handed" | "unknown"
- swing: "느림" | "보통" | "빠름" | "매우 빠름"
- play_style: "올라운더" | "베이스라이너 (수비형)" | "공격형 베이스라이너" | "서브앤발리 / 네트플레이어" | "스핀 위주" | "플랫 위주"
- confidence / stroke_confidence: "낮음" | "보통" | "높음"
- priorities 값은 각각 1~5 정수

반환 형식:
{
  "stroke_type": "forehand",
  "stroke_label": "포핸드",
  "handedness": "right-handed",
  "stroke_confidence": "높음",
  "swing": "빠름",
  "play_style": "스핀 위주",
  "confidence": "보통",
  "summary": "포핸드 스트로크로 보이며, 라켓이 몸 오른쪽에서 전방으로 지나가고 팔로스루가 반대쪽 어깨 방향으로 이어집니다.",
  "recommendation_note": "빠른 포핸드와 상향 스윙을 반영해 스핀과 컨트롤 우선순위를 조금 높입니다.",
  "observations": ["라켓 헤드가 임팩트 전 몸 뒤쪽에서 출발", "임팩트가 몸 앞쪽에서 형성", "팔로스루가 반대쪽 어깨 방향"],
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
        temperature: 0.05,
        maxOutputTokens: 1400,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 503) {
      const error = new Error('Gemini 모델 사용량이 많아 스윙 분석을 잠시 처리하지 못했습니다. 잠시 후 다시 시도하거나, 영상 분석 없이 아래 입력값으로 바로 추천을 실행해 주세요.');
      error.status = 503;
      throw error;
    }

    let message = 'Gemini 분석 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    try {
      const detail = await response.json();
      message = detail?.error?.message || message;
    } catch {
      // Keep the friendly fallback message instead of exposing raw upstream text.
    }
    throw new Error(message);
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
      .slice(0, 8);

    if (!safeFrames.length) {
      res.status(400).json({ error: '분석할 영상 프레임이 없습니다.' });
      return;
    }

    const analysis = await analyzeWithGemini(safeFrames);
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('swing analysis api error:', error);
    res.status(error.status || 500).json({ error: error.message || '스윙 분석 중 오류가 발생했습니다.' });
  }
}
