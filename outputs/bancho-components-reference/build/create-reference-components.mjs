import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "C:/Users/User/Documents/Portfolio";
const rootDir = path.join(workspaceDir, "outputs/bancho-components-reference");
const buildDir = path.join(rootDir, "build");
const skillDir = "C:/Users/User/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations";
const runtimePython = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const nodeModuleRoot = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_NODE_MODULES = nodeModuleRoot;
process.env.RUNTIME_NODE = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe";

const finalPath = path.join(rootDir, "bancho-components-reference.pptx");
const artifactDraftPath = path.join(buildDir, "candidate-artifact-tool.pptx");
const candidatePath = path.join(buildDir, "candidate.pptx");
const receiptPath = path.join(workspaceDir, "outputs/.bancho-components-reference-validation-final.json");
const renderDir = path.join(buildDir, "render");
const photoRoot = "D:/OneDrive/OneDrive/사진/Camera imports/2026-09-07";
const photos = [
  path.join(photoRoot, "20230223_120153.jpg"),
  path.join(photoRoot, "20220920_154506.jpg"),
];
const C = { paper: "#EEE9DF", bg: "#F2F1ED", brown: "#493C34", ink: "#292826", gold: "#D39A3F", muted: "#716960", line: "#D7CFC2", white: "#F8F5EF" };
const KFONT = "Pretendard";
const EFONT = "Georgia";
const W = 1280;
const H = 720;

await fs.mkdir(buildDir, { recursive: true });
const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, name, x, y, w, h, fill = "none", stroke = "none", strokeWidth = 0, rotation) {
  return slide.shapes.add({
    geometry, name,
    position: { left: x, top: y, width: w, height: h, ...(rotation === undefined ? {} : { rotation }) },
    fill, line: { style: "solid", fill: stroke, width: strokeWidth },
  });
}

function label(slide, name, value, x, y, w, h, size, color = C.ink, bold = false, opts = {}) {
  const s = shape(slide, "textbox", name, x, y, w, h);
  s.text = value;
  s.text.style = {
    typeface: opts.font ?? KFONT, fontSize: size, color, bold,
    alignment: opts.align ?? "left", verticalAlignment: opts.valign ?? "top",
    autoFit: "none", wrap: "square", lineSpacing: opts.lineSpacing ?? 1.12,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return s;
}

function sheet() {
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  return slide;
}

async function photo(slide, name, imagePath, alt, x, y, size) {
  const bytes = new Uint8Array(await fs.readFile(imagePath));
  return slide.images.add({
    blob: bytes, contentType: "image/jpeg", alt, fit: "contain",
    position: { left: x, top: y, width: size, height: size },
  });
}

// 1. Two independent title systems: a dark chapter banner and a numbered section opener.
{
  const slide = sheet();
  shape(slide, "rect", "01 Banner | brown field", 208, 78, 864, 132, C.brown);
  label(slide, "01 Banner | English title", "COOKING SYSTEM", 246, 96, 790, 52, 40, C.paper, false, { font: EFONT });
  shape(slide, "rect", "01 Banner | subtitle rule", 248, 157, 48, 2, C.gold);
  label(slide, "01 Banner | Korean subtitle", "조작과 판정", 246, 172, 500, 28, 18, C.paper);

  label(slide, "01 Section | number", "03", 106, 386, 155, 126, 102, C.brown, false, { font: "Times New Roman" });
  label(slide, "01 Section | English title", "COOKING SYSTEM", 286, 397, 840, 56, 42, C.brown, false, { font: EFONT });
  shape(slide, "rect", "01 Section | title rule", 288, 465, 552, 2, C.line);
  shape(slide, "diamond", "01 Section | saffron marker", 858, 459, 14, 14, C.gold);
  label(slide, "01 Section | Korean subtitle", "한 번의 절단을 기준으로 입력을 판정합니다", 288, 484, 838, 40, 21, C.ink);
}

// 2. Separate image objects on paper mats with editable captions.
{
  const slide = sheet();
  shape(slide, "rect", "02 Main photo | paper mat", 90, 93, 550, 570, C.white);
  await photo(slide, "02 Main photo | replaceable butadon", photos[0], "직접 만든 후쿠오카 부타동", 108, 108, 514);
  label(slide, "02 Main photo | caption", "직접 만든 후쿠오카 부타동", 112, 632, 500, 28, 18, C.brown, true);

  shape(slide, "rect", "02 Secondary photo | paper mat", 752, 270, 382, 382, C.white);
  await photo(slide, "02 Secondary photo | replaceable apple pie", photos[1], "직접 만든 애플파이", 797, 294, 292);
  label(slide, "02 Secondary photo | caption", "직접 만든 애플파이", 798, 607, 326, 25, 17, C.brown, true);
}

// 3. Three editable process steps linked by one quiet rule, plus a compact result strip.
{
  const slide = sheet();
  const steps = [
    ["01", "버튼 누르기", "왼쪽 마우스 버튼을 누릅니다."],
    ["02", "왕복해서 자르기", "누른 채 위아래로 한 번 왕복하면 절단 1회로 인정합니다."],
    ["03", "버튼 놓기", "한 번 자른 뒤 놓을 수 있습니다. 다음 절단에서 다시 누릅니다."],
  ];
  const ys = [104, 232, 360];
  shape(slide, "rect", "03 Process | connector rule", 162, 145, 2, 294, C.line);
  steps.forEach(([n, title, body], i) => {
    const y = ys[i];
    label(slide, `03 Step ${n} | number`, n, 104, y, 82, 70, 43, C.brown, false, { font: "Times New Roman" });
    shape(slide, "diamond", `03 Step ${n} | saffron marker`, 154, y + 80, 14, 14, C.gold);
    label(slide, `03 Step ${n} | title`, title, 222, y + 1, 870, 36, 23, C.brown, true);
    label(slide, `03 Step ${n} | instruction`, body, 222, y + 45, 930, 52, 18, C.ink, false, { lineSpacing: 1.2 });
  });
  shape(slide, "rect", "03 Result strip | paper field", 222, 520, 930, 102, C.paper);
  label(slide, "03 Result strip | cuts number", "3", 250, 529, 66, 68, 53, C.brown, false, { font: "Times New Roman" });
  label(slide, "03 Result strip | cuts label", "회 절단", 316, 550, 145, 33, 18, C.ink);
  shape(slide, "rect", "03 Result strip | divider", 491, 540, 1.5, 62, C.line);
  label(slide, "03 Result strip | pieces number", "4", 530, 529, 66, 68, 53, C.brown, false, { font: "Times New Roman" });
  label(slide, "03 Result strip | pieces label", "조각 완성", 596, 550, 176, 33, 18, C.ink);
}

// 4. Native editable table with a brown header and restrained horizontal rules.
{
  const slide = sheet();
  label(slide, "04 Rules | display title", "RULES", 98, 60, 460, 70, 46, C.brown, false, { font: EFONT });
  shape(slide, "rect", "04 Rules | title rule", 100, 132, 1080, 2, C.line);
  shape(slide, "diamond", "04 Rules | saffron marker", 1189, 126, 14, 14, C.gold);
  const table = slide.tables.add({
    rows: 5, columns: 2, left: 100, top: 172, width: 1080, height: 354,
    columnWidths: [450, 630],
    values: [
      ["입력", "판정"],
      ["세로 왕복 1회", "절단 1회"],
      ["짧은 움직임", "무시"],
      ["잘못된 방향", "절단 미인정, 10점 차감"],
      ["0점", "새 고기로 재시작"],
    ],
  });
  table.styleOptions = { headerRow: false, bandedRows: false };
  table.rows[0].height = 58;
  for (let row = 1; row < 5; row++) table.rows[row].height = 74;
  table.borders.assign({ style: "solid", fill: C.paper, width: 1 });
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      const cell = table.getCell(row, col);
      cell.fill = row === 0 ? C.brown : C.paper;
      cell.text.style = {
        typeface: KFONT, fontSize: row === 0 ? 19 : 20,
        color: row === 0 ? C.paper : C.ink, bold: row === 0 || col === 0,
        verticalAlignment: "middle", insets: { top: 12, right: 22, bottom: 12, left: 22 },
      };
    }
  }
  for (const y of [230, 304, 378, 452, 526]) shape(slide, "rect", `04 Rules | horizontal divider ${y}`, 100, y, 1080, 1, y === 230 ? C.brown : C.line);
  label(slide, "04 Rules | caveat", "시작 점수 30점. 수치는 개인 설계의 임시값입니다.", 102, 570, 1076, 34, 16, C.muted);
}

// 5. Before/after editorial comparison and a source-based input unit metric.
{
  const slide = sheet();
  shape(slide, "rect", "05 Before | header tag", 104, 110, 460, 47, C.brown);
  label(slide, "05 Before | header", "수정 전", 126, 119, 420, 30, 19, C.paper, true);
  shape(slide, "rect", "05 Before | paper field", 104, 157, 460, 162, C.paper);
  label(slide, "05 Before | copy", "마우스 버튼을 오래 누르는 것이 불편했습니다.", 130, 194, 408, 84, 21, C.ink, false, { lineSpacing: 1.22 });

  shape(slide, "rect", "05 After | header tag", 716, 110, 460, 47, C.brown);
  label(slide, "05 After | header", "수정 후", 738, 119, 420, 30, 19, C.paper, true);
  shape(slide, "rect", "05 After | paper field", 716, 157, 460, 162, C.paper);
  label(slide, "05 After | copy", "한 번의 절단마다 버튼을 놓을 수 있게 했습니다.", 742, 194, 408, 84, 21, C.ink, false, { lineSpacing: 1.22 });

  shape(slide, "rect", "05 Metric | horizontal rule", 104, 390, 1072, 2, C.line);
  label(slide, "05 Metric | numeral", "1", 114, 422, 76, 92, 70, C.brown, false, { font: "Times New Roman" });
  label(slide, "05 Metric | Korean unit", "회 절단 후 버튼 해제 가능", 202, 439, 470, 47, 24, C.brown, true);
  label(slide, "05 Caveat", "반복 주문에서의 피로감은 추가 확인이 필요합니다.", 636, 448, 530, 42, 17, C.muted);
}

const requirements = { explicitTotalSlideCount: 5, requiredNativeTableOwnerSlides: [4], requiredNativeChartOwnerSlides: [] };
const fontPolicy = { basis: "design", families: [KFONT, EFONT, "Times New Roman"] };
await (await PresentationFile.exportPptx(presentation)).save(artifactDraftPath);
const removeDefaultTableBorders = `
import sys, zipfile, xml.etree.ElementTree as ET
source, target = sys.argv[1:3]
ns = {'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
ET.register_namespace('a', ns['a'])
ET.register_namespace('p', 'http://schemas.openxmlformats.org/presentationml/2006/main')
ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
with zipfile.ZipFile(source, 'r') as src, zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as dst:
    for info in src.infolist():
        data = src.read(info.filename)
        if info.filename == 'ppt/slides/slide4.xml':
            root = ET.fromstring(data)
            for cell in root.findall('.//a:tcPr', ns):
                borders = []
                for edge in ('lnL', 'lnR', 'lnT', 'lnB'):
                    existing = cell.find('a:' + edge, ns)
                    if existing is not None:
                        cell.remove(existing)
                    line = ET.Element('{' + ns['a'] + '}' + edge, {'w':'12700'})
                    ET.SubElement(line, '{' + ns['a'] + '}noFill')
                    borders.append(line)
                for index, line in enumerate(borders):
                    cell.insert(index, line)
            data = ET.tostring(root, encoding='utf-8', xml_declaration=True)
        dst.writestr(info, data)
`;
execFileSync(runtimePython, ["-c", removeDefaultTableBorders, artifactDraftPath, candidatePath], { stdio: "inherit" });
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
const result = await finalizePresentation({
  ...requirements, workspaceDir, candidatePath, finalPath, pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit", "--require-native-table-slide", "4"],
  fontPolicy, verifyArtifactToolImport: true, receiptPath,
});
console.log("FINALIZER=" + JSON.stringify(result));

await fs.mkdir(renderDir, { recursive: true });
execFileSync(runtimePython, [path.join(skillDir, "container_tools/render_slides.py"), finalPath, "--output_dir", renderDir, "--width", "1600", "--height", "900"], { stdio: "inherit" });
for (let index = 1; index <= 5; index++) {
  const source = path.join(renderDir, `slide-${index}.png`);
  const destination = path.join(rootDir, `preview-${index}.png`);
  await fs.copyFile(source, destination);
  const bytes = await fs.readFile(destination);
  if (bytes.readUInt32BE(16) !== 1600 || bytes.readUInt32BE(20) !== 900 || bytes.length < 1000) throw new Error(`Invalid preview image: ${destination}`);
}

const structural = JSON.parse(execFileSync(runtimePython, ["-c", `
import json,sys,zipfile,xml.etree.ElementTree as ET
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(sys.argv[1]) as z:
 names=sorted((n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')),key=lambda n:int(n.rsplit('slide',1)[1].split('.')[0]))
 slides=[]
 for name in names:
  root=ET.fromstring(z.read(name)); slides.append({'shapes':len(root.findall('.//p:sp',ns)),'pictures':len(root.findall('.//p:pic',ns)),'tables':len(root.findall('.//a:tbl',ns)),'texts':[t.text or '' for t in root.findall('.//a:t',ns)]})
 print(json.dumps({'slideCount':len(names),'slides':slides}))
`, finalPath], { encoding: "utf8" }));
if (structural.slideCount !== 5 || structural.slides[3].tables !== 1 || structural.slides[1].pictures !== 2) throw new Error("PPTX structure check failed");
const requiredText = [
  ["COOKING SYSTEM", "조작과 판정", "한 번의 절단을 기준으로 입력을 판정합니다"],
  ["직접 만든 후쿠오카 부타동", "직접 만든 애플파이"],
  ["버튼 누르기", "왼쪽 마우스 버튼을 누릅니다.", "왕복해서 자르기", "누른 채 위아래로 한 번 왕복하면 절단 1회로 인정합니다.", "버튼 놓기", "한 번 자른 뒤 놓을 수 있습니다. 다음 절단에서 다시 누릅니다.", "3", "4"],
  ["RULES", "입력", "판정", "세로 왕복 1회", "절단 1회", "짧은 움직임", "무시", "잘못된 방향", "절단 미인정, 10점 차감", "0점", "새 고기로 재시작", "시작 점수 30점. 수치는 개인 설계의 임시값입니다."],
  ["수정 전", "마우스 버튼을 오래 누르는 것이 불편했습니다.", "수정 후", "한 번의 절단마다 버튼을 놓을 수 있게 했습니다.", "회 절단 후 버튼 해제 가능", "반복 주문에서의 피로감은 추가 확인이 필요합니다."],
];
for (let i = 0; i < 5; i++) {
  const slideText = structural.slides[i].texts.join("");
  for (const phrase of requiredText[i]) if (!slideText.includes(phrase)) throw new Error(`Slide ${i + 1} missing required text: ${phrase}`);
}
const hashes = {};
for (const name of ["bancho-components-reference.pptx", ...Array.from({ length: 5 }, (_, i) => `preview-${i + 1}.png`)]) hashes[name] = createHash("sha256").update(await fs.readFile(path.join(rootDir, name))).digest("hex");
const receipt = JSON.parse(await fs.readFile(receiptPath, "utf8"));
receipt.deliveryChecks = { slideCount: structural.slideCount, nativeTableOnSlide4: true, replaceablePhotosOnSlide2: 2, nativeShapeCounts: structural.slides.map((s) => s.shapes), requiredTextPresent: true, previewFiles: Object.keys(hashes).filter((name) => name.endsWith(".png")), sha256: hashes };
await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
console.log("DELIVERY_CHECKS=" + JSON.stringify(receipt.deliveryChecks));
