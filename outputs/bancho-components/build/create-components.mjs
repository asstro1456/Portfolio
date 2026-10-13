import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "C:/Users/User/Documents/Portfolio";
const outputDir = path.join(workspaceDir, "outputs/bancho-components");
const buildDir = path.join(outputDir, "build");
const skillDir = "C:/Users/User/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations";
const runtimePython = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const nodeModuleRoot = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_NODE_MODULES = nodeModuleRoot;
process.env.RUNTIME_NODE = "C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe";

const finalPath = path.join(outputDir, "bancho-components.pptx");
const candidatePath = path.join(buildDir, "candidate.pptx");
const receiptPath = path.join(workspaceDir, "outputs/.bancho-components-validation-revised.json");
const renderDir = path.join(buildDir, "render");
const photoPath = "D:/OneDrive/OneDrive/사진/Camera imports/2026-09-07/20230223_120153.jpg";
const C = { bg: "#F2F1ED", warm: "#EEE9DF", brown: "#493C34", ink: "#292826", saffron: "#D39A3F", muted: "#69635D", rule: "#D8D3CA" };
const FONT = "Pretendard";
const W = 1280;
const H = 720;

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function shape(slide, geometry, name, x, y, w, h, fill = "none", lineFill = "none", lineWidth = 0) {
  return slide.shapes.add({ geometry, name, position: { left: x, top: y, width: w, height: h }, fill, line: { style: "solid", fill: lineFill, width: lineWidth } });
}

function text(slide, name, value, x, y, w, h, size, color = C.ink, bold = false, options = {}) {
  const item = shape(slide, "textbox", name, x, y, w, h);
  item.text = value;
  item.text.style = {
    typeface: FONT, fontSize: size, color, bold,
    alignment: options.align ?? "left", verticalAlignment: options.valign ?? "top",
    autoFit: "none", wrap: "square", lineSpacing: options.lineSpacing ?? 1.15,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return item;
}

function addSlide() {
  const slide = presentation.slides.add();
  slide.background.fill = C.bg;
  return slide;
}

// 1. Title and subtitle, with separate editing notes and palette swatches.
{
  const slide = addSlide();
  text(slide, "01 Title module | title", "반쵸 더 셰프", 112, 225, 1010, 74, 52, C.brown, true);
  text(slide, "01 Title module | subtitle", "요리 경험을 조작 설계로 연결했습니다", 114, 315, 1010, 42, 24, C.ink);
  const swatches = [[C.warm, "#EEE9DF"], [C.bg, "#F2F1ED"], [C.brown, "#493C34"], [C.ink, "#292826"], [C.saffron, "#D39A3F"]];
  swatches.forEach(([color, label], index) => {
    const x = 112 + index * 94;
    shape(slide, "rect", `01 Palette swatch ${label}`, x, 420, 42, 24, color, C.rule, 0.6);
    text(slide, `01 Palette label ${label}`, label, x, 451, 76, 18, 11, C.muted);
  });
  text(slide, "01 Instructions", "사용: 프로젝트명과 한 줄 설명을 바꿔 표지나 섹션 시작에 배치하세요.\n색상 견본과 이 안내는 컴포넌트 바깥의 참고 요소입니다.", 112, 535, 1010, 52, 14, C.muted, false, { lineSpacing: 1.25 });
}

// 2. Replaceable image and independent caption.
{
  const slide = addSlide();
  const imageBytes = new Uint8Array(await fs.readFile(photoPath));
  slide.images.add({ blob: imageBytes, contentType: "image/jpeg", alt: "직접 만든 후쿠오카 부타동", fit: "cover", position: { left: 245, top: 122, width: 790, height: 440 } });
  text(slide, "02 Photo caption", "직접 만든 후쿠오카 부타동", 245, 584, 790, 34, 20, C.ink);
}

// 3. Editable cutting input and result text.
{
  const slide = addSlide();
  text(slide, "03 Input and result | label", "한 번의 절단", 160, 154, 960, 40, 26, C.brown, true);
  text(slide, "03 Input and result | input", "왼쪽 버튼을 누른 채 위아래로 왕복 1회", 160, 226, 960, 55, 25, C.ink);
  text(slide, "03 Input and result | allowance", "한 번 자른 뒤 버튼을 놓아도 됩니다.", 160, 310, 960, 46, 22, C.ink);
  shape(slide, "rect", "03 Input and result | accent", 160, 395, 4, 58, C.saffron);
  text(slide, "03 Input and result | result", "세로 절단 3회로 고기 4조각 완성", 184, 400, 920, 48, 24, C.brown, true);
}

// 4. Native editable PowerPoint table with exact rule rows.
{
  const slide = addSlide();
  const table = slide.tables.add({
    rows: 5, columns: 2, left: 112, top: 128, width: 1056, height: 350,
    columnWidths: [452, 604],
    values: [
      ["입력", "판정"],
      ["세로 왕복 1회", "절단 1회"],
      ["짧은 움직임", "무시"],
      ["잘못된 방향", "절단 미인정, 10점 차감"],
      ["0점", "새 고기로 재시작"],
    ],
  });
  table.styleOptions = { headerRow: false, bandedRows: false };
  table.rows[0].height = 56;
  for (let row = 1; row < 5; row++) table.rows[row].height = 73.5;
  table.borders.assign({ style: "solid", fill: C.rule, width: 1 });
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      const cell = table.getCell(row, col);
      cell.fill = row === 0 ? C.warm : C.bg;
      cell.text.style = { typeface: FONT, fontSize: row === 0 ? 19 : 18, color: row === 0 ? C.brown : C.ink, bold: row === 0 || col === 0 };
    }
  }
  text(slide, "04 Table caption", "시작 점수 30점. 수치는 개인 설계의 임시값입니다.", 112, 551, 1056, 28, 16, C.muted);
}

// 5. Before and after comparison blocks with a separate caveat.
{
  const slide = addSlide();
  text(slide, "05 Before | heading", "불편했던 점", 132, 174, 438, 34, 22, C.brown, true);
  text(slide, "05 Before | copy", "마우스 버튼을 오래 누르는 것이 불편했습니다.", 132, 229, 438, 94, 22, C.ink, false, { lineSpacing: 1.25 });
  shape(slide, "rect", "05 Comparison divider", 630, 170, 1.5, 188, C.rule);
  text(slide, "05 After | heading", "수정한 점", 690, 174, 438, 34, 22, C.brown, true);
  text(slide, "05 After | copy", "한 번의 절단마다 버튼을 놓을 수 있게 했습니다.", 690, 229, 438, 94, 22, C.ink, false, { lineSpacing: 1.25 });
  text(slide, "05 Caveat", "반복 주문에서의 피로감은 추가 확인이 필요합니다.", 132, 444, 996, 28, 16, C.muted);
}

const requirements = { explicitTotalSlideCount: 5, requiredNativeTableOwnerSlides: [4], requiredNativeChartOwnerSlides: [] };
const fontPolicy = { basis: "user_request", families: [FONT] };
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
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
const renderer = path.join(skillDir, "container_tools/render_slides.py");
execFileSync(runtimePython, [renderer, finalPath, "--output_dir", renderDir, "--width", "1600", "--height", "900"], { stdio: "inherit" });
for (let index = 1; index <= 5; index++) {
  const source = path.join(renderDir, `slide-${index}.png`);
  const destination = path.join(outputDir, `bancho-component-${index}.png`);
  await fs.copyFile(source, destination);
  const bytes = await fs.readFile(destination);
  if (bytes.readUInt32BE(16) !== 1600 || bytes.readUInt32BE(20) !== 900 || bytes.length < 1000) throw new Error(`Invalid preview image: ${destination}`);
}

const integrity = JSON.parse(execFileSync(runtimePython, ["-c", `
import json,sys,zipfile,xml.etree.ElementTree as ET
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(sys.argv[1]) as z:
 names=sorted((n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')),key=lambda n:int(n.rsplit('slide',1)[1].split('.')[0]))
 records=[]
 for name in names:
  root=ET.fromstring(z.read(name)); records.append({'name':name,'shapes':len(root.findall('.//p:sp',ns)),'pictures':len(root.findall('.//p:pic',ns)),'tables':len(root.findall('.//a:tbl',ns)),'text':' '.join(t.text or '' for t in root.findall('.//a:t',ns))})
 print(json.dumps({'slides':len(names),'records':records}))
`, finalPath], { encoding: "utf8" }));
if (integrity.slides !== 5 || integrity.records[3].tables !== 1 || integrity.records[1].pictures !== 1) throw new Error("PPTX structure check failed");
if (integrity.records.some((slide) => slide.shapes === 0)) throw new Error("A component sheet has no native PowerPoint shapes");
const hashes = {};
for (const filename of ["bancho-components.pptx", ...Array.from({ length: 5 }, (_, i) => `bancho-component-${i + 1}.png`)]) {
  hashes[filename] = createHash("sha256").update(await fs.readFile(path.join(outputDir, filename))).digest("hex");
}
const receipt = JSON.parse(await fs.readFile(receiptPath, "utf8"));
receipt.userChecks = { slideCount: integrity.slides, nativeTableOnSlide4: true, separateReplaceablePhotoOnSlide2: true, editableShapeCounts: integrity.records.map(({ shapes }) => shapes), previews: Object.keys(hashes).filter((name) => name.endsWith(".png")), sha256: hashes };
await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
console.log("PPTX_CHECKS=" + JSON.stringify(receipt.userChecks));
