import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "C:/Users/User/Documents/Portfolio/outputs/bancho-b-samples";
const buildDir = path.join(workspaceDir, "build");
const deliverablesDir = path.join(workspaceDir, "deliverables");
const skillDir = "C:/Users/User/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const runtimePython = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const nodeModuleRoot = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_NODE_MODULES = nodeModuleRoot;
process.env.RUNTIME_NODE = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe";
const candidatePath = path.join(buildDir, "candidate-v3.pptx");
const finalPath = path.join(deliverablesDir, "bancho-b-samples-v3.pptx");
const receiptPath = path.join(buildDir, "bancho-b-samples-v3-run.validation.json");
const renderDir = path.join(buildDir, "render-v3");
const prototypePath = "C:/Users/User/Documents/Portfolio/assets/prototypes/bancho-reciprocal-cut-prototype.html";
const trailerPath = "C:/Users/User/Documents/codex-gpt/창작 기획/01_조사/반쵸 더 쉐프/10.PNG";
const photoRoot = "D:/OneDrive/OneDrive/사진/Camera imports/2026-09-07";
const photoPaths = [
  path.join(photoRoot, "20230223_120153.jpg"),
  path.join(photoRoot, "20220920_154506.jpg"),
  path.join(photoRoot, "20230707_084601.jpg"),
];

const C = {
  bg: "#F2F1ED",
  brown: "#493C34",
  ink: "#292826",
  saffron: "#D39A3F",
  muted: "#69635D",
};
const FONT = "Pretendard";
const W = 1280;
const H = 720;

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(deliverablesDir, { recursive: true });

const prototypeShotPath = path.join(buildDir, "prototype-cut-v3.png");
const { chromium } = await import(pathToFileURL(path.join(nodeModuleRoot, "playwright/index.mjs")).href);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(prototypePath).href, { waitUntil: "networkidle" });
const cutArea = page.locator("#cutArea");
if (await cutArea.count() !== 1 || !(await cutArea.isVisible())) throw new Error("Prototype #cutArea is unavailable");
await cutArea.screenshot({ path: prototypeShotPath });
await browser.close();
console.log("PROTOTYPE_SCREENSHOT=CAPTURED #cutArea");

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, x, y, w, h, fill = "none", lineFill = "none", lineWidth = 0, name) {
  return slide.shapes.add({
    geometry,
    ...(name ? { name } : {}),
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: lineFill, width: lineWidth },
  });
}

function text(slide, value, x, y, w, h, size, color = C.ink, bold = false, opts = {}) {
  const s = shape(slide, "textbox", x, y, w, h, "none", "none", 0, opts.name);
  s.text = value;
  s.text.style = {
    typeface: FONT,
    fontSize: size,
    bold,
    color,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
    autoFit: "none",
    wrap: "square",
    lineSpacing: opts.lineSpacing ?? 1.15,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return s;
}

async function addImage(slide, imagePath, type, x, y, w, h, alt, fit = "contain") {
  const blob = new Uint8Array(await fs.readFile(imagePath));
  return slide.images.add({
    blob,
    contentType: type,
    alt,
    fit,
    position: { left: x, top: y, width: w, height: h },
  });
}

function addNotes(slide, value) {
  slide.speakerNotes.textFrame.setText(value);
}

// Approved 1600x900 coordinates scale to this 1280x720 slide.
{
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  await addImage(slide, trailerPath, "image/png", 0, 0, 1280, 480, "반쵸 더 셰프 트레일러 장면", "cover");
  text(slide, "반쵸 더 셰프\n돈테키 조리 시스템 제안", 64, 517, 688, 72, 42, C.brown, true, { name: "cover-title", lineSpacing: 1.02 });
  text(slide, "게임 기획 포트폴리오 / 이동현", 64, 625, 688, 24, 20, C.ink);
  text(slide, "고기를 자르고 굽는 두 공정의 조작과 판정을 설계했습니다.", 824, 530, 384, 66, 22, C.ink, false, { lineSpacing: 1.15 });
  text(slide, "공개 자료를 분석한 개인 제안입니다.", 824, 610, 384, 32, 20, C.ink);
  shape(slide, "rect", 1116, 16, 100, 25, C.bg, "none", 0, "trailer-caption-bg");
  text(slide, "트레일러 화면", 1120, 19, 92, 20, 12, C.ink);
  addNotes(slide, `이미지 출처: ${trailerPath}. 공개 트레일러 캡처. 원본 URL과 타임스탬프는 확인되지 않음.`);
}

// Slide 2
{
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  text(slide, "취사병이 되기 전부터 요리를 즐겼습니다", 64, 52, 1152, 44, 31.5, C.brown, true, { name: "experience-title" });
  text(slide, "대학 시절에는 요리 영상을 보며 부타동과 비프 부르기뇽,\n파이와 쿠키를 만들었습니다.\n식극의 소마에 나온 사과 리조또를 따라 만들어 보기도 했습니다.", 64, 124, 560, 132, 20, C.ink, false, { lineSpacing: 1.28 });
  text(slide, "반쵸에서는 직접 요리해 본 경험을 조작에 담고 싶었습니다.\n다만 여러 주문을 처리하는 흐름을 고려해,\n돈테키를 자르고 굽는 두 공정에 집중했습니다.", 640, 124, 576, 132, 20, C.ink, false, { lineSpacing: 1.28 });

  await addImage(slide, photoPaths[0], "image/jpeg", 64, 280, 496, 336, "직접 만든 후쿠오카 부타동", "cover");
  await addImage(slide, photoPaths[1], "image/jpeg", 580, 280, 308, 336, "직접 만든 애플파이", "cover");
  await addImage(slide, photoPaths[2], "image/jpeg", 908, 280, 308, 336, "직접 만든 쿠키", "cover");
  text(slide, "직접 만든 후쿠오카 부타동", 64, 632, 496, 22, 15, C.ink);
  text(slide, "애플파이", 580, 632, 308, 22, 15, C.ink);
  text(slide, "쿠키", 908, 632, 308, 22, 15, C.ink);
  text(slide, "학부 시절 직접 만든 요리", 64, 671, 480, 20, 13, C.muted);
  addNotes(slide, `사진 출처: 사용자 제공 사진 ${photoPaths.join("; ")}.`);
}

// Slide 3
{
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  text(slide, "한 번 썰고 나면 버튼을 놓을 수 있게 했습니다", 64, 44, 1152, 42, 28, C.brown, true, { name: "cutting-title" });
  await addImage(slide, prototypeShotPath, "image/png", 64, 120, 588, 376, "자르기 HTML 시제품 조작 영역", "contain");
  text(slide, "개인 설계로 만든 자르기 HTML 시제품", 64, 504, 588, 21, 15, C.ink);

  text(slide, "한 번의 절단", 696, 132, 520, 30, 22, C.brown, true);
  text(slide, "왼쪽 버튼을 누른 채\n위아래로 왕복 1회", 696, 174, 520, 58, 24, C.ink, true, { lineSpacing: 1.08 });
  text(slide, "한 번 자른 뒤 버튼을 놓아도 되고, 계속 누른 채 다음 절단을 이어가도 됩니다.", 696, 235, 520, 60, 18, C.ink, false, { lineSpacing: 1.2 });
  text(slide, "세로 절단 3회로 고기 4조각 완성", 696, 308, 520, 34, 20, C.ink, true);
  text(slide, "너무 짧은 움직임은 무시합니다.\n잘못된 방향은 절단으로 세지 않고 10점을 차감합니다.\n30점에서 시작하며, 0점이면 새 고기로 다시 시작합니다.", 696, 355, 520, 104, 18, C.ink, false, { lineSpacing: 1.3 });
  text(slide, "점수와 절단 횟수는 시제품의 임시값입니다.", 696, 468, 520, 21, 14, C.muted);

  text(slide, "직접 조작하며 발견한 불편", 64, 552, 520, 28, 19, C.brown, true);
  text(slide, "버튼을 오래 누르고 있으니 불편했습니다. 한 번의 절단마다 입력을 끝낼 수 있도록 판정 단위를 줄였습니다.", 64, 590, 520, 76, 18, C.ink, false, { lineSpacing: 1.23 });
  text(slide, "수정 후 확인한 점", 696, 552, 520, 28, 19, C.brown, true);
  text(slide, "직접 조작했을 때는 이전보다 편했습니다. 여러 주문에서 반복할 때의 피로감은 더 확인해야 합니다.", 696, 590, 520, 76, 18, C.ink, false, { lineSpacing: 1.23 });
  addNotes(slide, `자르기 규칙은 개인 설계입니다. 화면은 ${prototypePath}에서 캡처했습니다. 시제품 코드는 수정하지 않았으며, 본문에 기재한 규칙의 실제 기능 검증은 이번 작업에서 수행하지 않았습니다.`);
}

const fontPolicy = { basis: "user_request", families: [FONT] };
const requirements = {
  explicitTotalSlideCount: 3,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};

await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
const finalization = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath,
});
console.log("FINALIZER_RESULT=" + JSON.stringify(finalization));

const renderer = path.join(skillDir, "container_tools/render_slides.py");
await fs.mkdir(renderDir, { recursive: true });
execFileSync(runtimePython, [renderer, finalPath, "--output_dir", renderDir, "--width", "1600", "--height", "900"], { stdio: "inherit" });
for (let index = 1; index <= 3; index++) {
  const renderedPath = path.join(renderDir, `slide-${index}.png`);
  const outputPath = path.join(deliverablesDir, `slide-${index}-v3.png`);
  await fs.copyFile(renderedPath, outputPath);
  const png = await fs.readFile(outputPath);
  if (png.readUInt32BE(16) !== 1600 || png.readUInt32BE(20) !== 900 || png.length < 1000) {
    throw new Error(`Unexpected PNG output: ${outputPath}`);
  }
}

const finalHash = createHash("sha256").update(await fs.readFile(finalPath)).digest("hex");
const receipt = JSON.parse(await fs.readFile(receiptPath, "utf8"));
if (receipt.finalSha256 !== finalHash) throw new Error("Validation receipt SHA256 does not match the final PPTX");
const extracted = JSON.parse(execFileSync(runtimePython, ["-c", `
import json, sys, zipfile, xml.etree.ElementTree as ET
with zipfile.ZipFile(sys.argv[1]) as z:
    slides = sorted((n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')), key=lambda n: int(n.rsplit('slide', 1)[1].split('.')[0]))
    texts = []
    for name in slides:
        root = ET.fromstring(z.read(name))
        texts.append(''.join(node.text or '' for node in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t')))
    print(json.dumps({'slideCount': len(slides), 'textLengths': [len(value) for value in texts], 'allSlidesHaveText': all(texts)}))
`, finalPath], { encoding: "utf8" }));
if (extracted.slideCount !== 3 || !extracted.allSlidesHaveText) throw new Error("PPTX text extraction did not find text on all three slides");
receipt.technicalChecks = {
  sha256MatchesFinalFile: true,
  renderedPngs: [1, 2, 3].map((index) => `slide-${index}-v3.png`),
  textExtraction: extracted,
};
await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
console.log("FINAL_PPTX=" + finalPath);
