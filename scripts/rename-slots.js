/**
 * tech-dictionary.json의 RPG 슬롯 키를 중립 용어로 변경하는 일회성 스크립트.
 * RBYE-API 디렉토리에서 실행:
 *   node ~/Desktop/jaewan-develop/RBYE/scripts/rename-slots.js
 */
const fs = require("fs");
const path = require("path");

const dictPath = path.join(__dirname, "../../RBYE-API/json/tech-dictionary.json");

if (!fs.existsSync(dictPath)) {
  console.error("tech-dictionary.json을 찾을 수 없습니다:", dictPath);
  process.exit(1);
}

const raw = fs.readFileSync(dictPath, "utf-8");

const RENAME_MAP = {
  '"기본장착"': '"기초"',
  '"주무기"': '"핵심"',
  '"보조장비"': '"확장"',
  '"전투도구"': '"도구"',
  '"고급장비"': '"인프라"',
};

let renamed = raw;
Object.entries(RENAME_MAP).forEach(([from, to]) => {
  renamed = renamed.split(from).join(to);
});

fs.writeFileSync(dictPath, renamed, "utf-8");
console.log("tech-dictionary.json 슬롯 키 변경 완료:");
Object.entries(RENAME_MAP).forEach(([from, to]) => {
  console.log(`  ${from} → ${to}`);
});
