/**
 * 2026-03-18 키워드 승인 + keywordTypes 추가 스크립트
 * 실행: node scripts/add-keywords-2026-03-18.js
 */
const fs = require("fs");
const path = require("path");

const dictPath = path.join(__dirname, "../../RBYE-API/json/tech-dictionary.json");
const dict = JSON.parse(fs.readFileSync(dictPath, "utf-8"));

// --- 승인 키워드 목록 ---

const ADDITIONS = {
  frontend: [
    { keyword: "TanStack", type: "tech", slot: "확장" },
    { keyword: "Turborepo", type: "tech", slot: "도구" },
    { keyword: "Jotai", type: "tech", slot: "확장" },
    { keyword: "Electron", type: "tech", slot: "핵심" },
    { keyword: "SPA", type: "concept", slot: "핵심" },
    { keyword: "SSR", type: "concept", slot: "핵심" },
    { keyword: "E2E", type: "concept", slot: "인프라" },
  ],
  nodejs: [
    { keyword: "Lambda", type: "tech", slot: "인프라" },
    { keyword: "RDBMS", type: "concept", slot: "확장" },
    { keyword: "NoSQL", type: "concept", slot: "확장" },
    { keyword: "ORM", type: "concept", slot: "확장" },
  ],
  server: [
    { keyword: "GCP", type: "tech", slot: "인프라" },
    { keyword: "Azure", type: "tech", slot: "인프라" },
    { keyword: "ECS", type: "tech", slot: "인프라" },
    { keyword: "EKS", type: "tech", slot: "인프라" },
    { keyword: "ArgoCD", type: "tech", slot: "인프라" },
    { keyword: "Airflow", type: "tech", slot: "인프라" },
    { keyword: "SQS", type: "tech", slot: "도구" },
    { keyword: "Golang", type: "tech", slot: "기초" },
    { keyword: "ELK", type: "tech", slot: "인프라" },
    { keyword: "RDBMS", type: "concept", slot: "확장" },
    { keyword: "NoSQL", type: "concept", slot: "확장" },
    { keyword: "ORM", type: "concept", slot: "핵심" },
    { keyword: "IaC", type: "concept", slot: "인프라" },
    { keyword: "DDD", type: "concept", slot: "핵심" },
    { keyword: "MLOps", type: "concept", slot: "AI활용" },
  ],
  pm: [
    { keyword: "GA4", type: "tech", slot: "확장" },
    { keyword: "PRD", type: "concept", slot: "기초" },
    { keyword: "VOC", type: "concept", slot: "확장" },
    { keyword: "Agile", type: "concept", slot: "기초" },
    { keyword: "Scrum", type: "concept", slot: "기초" },
    { keyword: "PMF", type: "concept", slot: "기초" },
  ],
};

// --- 반영 ---

let totalAdded = 0;

Object.entries(ADDITIONS).forEach(([cat, items]) => {
  if (!dict[cat]) return;

  // keywordTypes 필드 초기화
  if (!dict[cat].keywordTypes) {
    dict[cat].keywordTypes = {};
  }

  items.forEach(({ keyword, type, slot }) => {
    // keywords 배열에 추가
    if (!dict[cat].keywords.includes(keyword)) {
      dict[cat].keywords.push(keyword);
    }

    // 슬롯의 skills에 추가
    if (dict[cat].categories[slot]) {
      if (!dict[cat].categories[slot].skills.includes(keyword)) {
        dict[cat].categories[slot].skills.push(keyword);
      }
    } else {
      console.warn(`  [경고] ${cat}에 슬롯 "${slot}" 없음 (${keyword})`);
    }

    // keywordTypes 기록 (concept만 명시, tech는 기본값)
    if (type === "concept") {
      dict[cat].keywordTypes[keyword] = "concept";
    }

    totalAdded++;
  });
});

fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), "utf-8");

console.log(`\ntech-dictionary.json 업데이트 완료: ${totalAdded}건 추가`);
console.log("\n카테고리별 현황:");
Object.keys(dict).forEach((cat) => {
  const concepts = Object.values(dict[cat].keywordTypes || {}).filter((t) => t === "concept").length;
  console.log(`  [${cat}] 키워드 ${dict[cat].keywords.length}개 (concept ${concepts}개)`);
});
console.log("\n다음 단계: cd RBYE-API && node analyze.js");
