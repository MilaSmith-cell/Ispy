"use strict";

// Set to true while adjusting the SVG hit areas.
const DEBUG = false;
const SVG_NS = "http://www.w3.org/2000/svg";
const SCENE_PATH = "assets/scene.png";

const colorNames = {
  yellow: "ЖЁЛТОЕ", white: "БЕЛОЕ", brown: "КОРИЧНЕВОЕ",
  pink: "РОЗОВОЕ", blue: "СИНЕЕ", green: "ЗЕЛЁНОЕ",
  purple: "ФИОЛЕТОВОЕ", orange: "ОРАНЖЕВОЕ", red: "КРАСНОЕ"
};

// All coordinates use the source image coordinate system: 1408 x 768.
const objects = [
  { id: "sun", letter: "A", color: "yellow", label: "солнце", shape: "circle", coords: { cx: 245, cy: 82, r: 66 } },
  { id: "cloud", letter: "B", color: "white", label: "белое облако", shape: "ellipse", coords: { cx: 124, cy: 71, rx: 65, ry: 34 } },
  { id: "owl", letter: "C", color: "brown", label: "сова", shape: "ellipse", coords: { cx: 556, cy: 248, rx: 31, ry: 42 } },
  { id: "acorn", letter: "D", color: "brown", label: "жёлудь", shape: "ellipse", coords: { cx: 539, cy: 91, rx: 17, ry: 24 }, rotate: -35 },
  { id: "pink-bird", letter: "E", color: "pink", label: "розовая птица", shape: "ellipse", coords: { cx: 1233, cy: 185, rx: 48, ry: 34 } },
  { id: "blue-bird", letter: "F", color: "blue", label: "синяя птица", shape: "ellipse", coords: { cx: 1000, cy: 137, rx: 45, ry: 32 }, rotate: -12 },
  { id: "green-bird", letter: "G", color: "green", label: "зелёная птица", shape: "ellipse", coords: { cx: 1128, cy: 131, rx: 43, ry: 29 }, rotate: 8 },
  { id: "dragonfly", letter: "H", color: "blue", label: "стрекоза", shape: "ellipse", coords: { cx: 574, cy: 342, rx: 39, ry: 25 }, rotate: 35 },
  { id: "frog", letter: "I", color: "green", label: "лягушка", shape: "ellipse", coords: { cx: 675, cy: 528, rx: 49, ry: 42 } },
  { id: "purple-fish", letter: "J", color: "purple", label: "фиолетовая рыба", shape: "ellipse", coords: { cx: 521, cy: 583, rx: 44, ry: 24 } },
  { id: "orange-fish", letter: "K", color: "orange", label: "оранжевая рыба", shape: "ellipse", coords: { cx: 679, cy: 621, rx: 43, ry: 23 } },
  { id: "blue-fish", letter: "L", color: "blue", label: "синяя рыба", shape: "ellipse", coords: { cx: 806, cy: 588, rx: 43, ry: 24 } },
  { id: "lizard", letter: "M", color: "green", label: "ящерица", shape: "polygon", coords: { points: "964,467 992,460 1027,471 1057,490 1080,529 1070,559 1044,549 1036,521 1005,509 975,500" } },
  { id: "grasshopper", letter: "N", color: "green", label: "кузнечик", shape: "polygon", coords: { points: "1145,543 1174,539 1208,554 1240,575 1212,593 1170,579 1145,566" } },
  { id: "orange-butterfly", letter: "O", color: "orange", label: "оранжевая бабочка", shape: "ellipse", coords: { cx: 184, cy: 407, rx: 30, ry: 27 }, rotate: 25 },
  { id: "pink-butterfly", letter: "P", color: "pink", label: "розовая бабочка", shape: "ellipse", coords: { cx: 1037, cy: 605, rx: 35, ry: 31 }, rotate: -12 },
  { id: "blue-butterfly", letter: "Q", color: "blue", label: "синяя бабочка", shape: "ellipse", coords: { cx: 1265, cy: 507, rx: 30, ry: 25 }, rotate: -30 },
  { id: "red-apple", letter: "R", color: "red", label: "красное яблоко", shape: "circle", coords: { cx: 880, cy: 196, r: 20 } },
  { id: "yellow-pear", letter: "S", color: "yellow", label: "жёлтая груша", shape: "ellipse", coords: { cx: 1101, cy: 238, rx: 23, ry: 31 } },
  { id: "pink-raspberry", letter: "T", color: "pink", label: "розовая малина", shape: "ellipse", coords: { cx: 106, cy: 627, rx: 24, ry: 24 } },
  { id: "blue-blackberry", letter: "U", color: "blue", label: "синяя ежевика", shape: "circle", coords: { cx: 275, cy: 647, r: 21 } },
  { id: "strawberry", letter: "V", color: "red", label: "клубника", shape: "ellipse", coords: { cx: 1253, cy: 694, rx: 20, ry: 24 }, rotate: -16 },
  { id: "blueberry", letter: "W", color: "blue", label: "черника", shape: "circle", coords: { cx: 1102, cy: 700, r: 20 } },
  { id: "yellow-flower", letter: "X", color: "yellow", label: "жёлтый цветок", shape: "circle", coords: { cx: 748, cy: 455, r: 22 } },
  { id: "red-flower", letter: "Y", color: "red", label: "красный цветок", shape: "circle", coords: { cx: 737, cy: 692, r: 18 } },
  { id: "orange-squirrel", letter: "Z", color: "orange", label: "оранжевая белка", shape: "polygon", coords: { points: "252,415 286,403 322,423 340,385 379,389 406,431 403,492 373,528 321,528 280,500 250,458" } }
];

const state = {
  currentColor: null,
  pendingObjectId: null,
  inputLocked: true,
  soundEnabled: true,
  foundIds: new Set(),
  audioContext: null,
  modalReturnFocus: null
};

const els = {
  image: document.querySelector("#sceneImage"),
  overlay: document.querySelector("#gameOverlay"),
  defs: document.querySelector("#svgDefs"),
  foundLayer: document.querySelector("#foundLayer"),
  hotspotLayer: document.querySelector("#hotspotLayer"),
  debugLabelLayer: document.querySelector("#debugLabelLayer"),
  loading: document.querySelector("#loading"),
  questionCard: document.querySelector("#questionCard"),
  colorWord: document.querySelector("#colorWord"),
  progress: document.querySelector("#progress"),
  soundButton: document.querySelector("#soundButton"),
  soundIcon: document.querySelector("#soundIcon"),
  soundLabel: document.querySelector("#soundLabel"),
  letterModal: document.querySelector("#letterModal"),
  closeModal: document.querySelector("#closeModal"),
  letter: document.querySelector("#letter"),
  winModal: document.querySelector("#winModal"),
  winScore: document.querySelector("#winScore"),
  playAgain: document.querySelector("#playAgain"),
  backgroundMusic: document.querySelector("#backgroundMusic")
};

function createShape(object, className = "") {
  const shape = document.createElementNS(SVG_NS, object.shape);
  Object.entries(object.coords).forEach(([name, value]) => shape.setAttribute(name, String(value)));
  if (object.rotate) {
    const { x, y } = getCenter(object);
    shape.setAttribute("transform", `rotate(${object.rotate} ${x} ${y})`);
  }
  if (className) shape.setAttribute("class", className);
  return shape;
}

function getCenter(object) {
  const c = object.coords;
  if ("cx" in c) return { x: c.cx, y: c.cy };
  const values = c.points.trim().split(/[ ,]+/).map(Number);
  const xs = values.filter((_, i) => i % 2 === 0);
  const ys = values.filter((_, i) => i % 2 === 1);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2
  };
}

function getCrossSize(object) {
  if (object.shape === "circle") return Math.max(13, Math.min(object.coords.r * .62, 25));
  if (object.shape === "ellipse") return Math.max(14, Math.min(object.coords.rx * .55, object.coords.ry * .7, 28));
  return 27;
}

function renderHotspots() {
  els.hotspotLayer.replaceChildren();
  els.debugLabelLayer.replaceChildren();
  document.body.classList.toggle("debug", DEBUG);

  objects.forEach((object) => {
    const hotspot = createShape(object, "hotspot");
    hotspot.dataset.id = object.id;
    hotspot.dataset.color = object.color;
    hotspot.setAttribute("role", "button");
    hotspot.setAttribute("tabindex", "0");
    hotspot.setAttribute("aria-label", `Выбрать: ${object.label}`);
    els.hotspotLayer.append(hotspot);

    if (DEBUG) {
      const center = getCenter(object);
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", center.x);
      label.setAttribute("y", center.y);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "debug-label");
      label.textContent = object.id;
      els.debugLabelLayer.append(label);
    }
  });
}

function initGame() {
  renderHotspots();
  bindEvents();
  updateProgress();
  chooseNextColor();
  state.inputLocked = false;
  els.loading.classList.add("is-hidden");
}

function bindEvents() {
  els.hotspotLayer.addEventListener("click", (event) => {
    const target = event.target.closest(".hotspot");
    if (target) handleObjectSelection(target.dataset.id);
  });

  els.hotspotLayer.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest(".hotspot");
    if (!target) return;
    event.preventDefault();
    handleObjectSelection(target.dataset.id);
  });

  els.closeModal.addEventListener("click", closeLetterModal);
  els.soundButton.addEventListener("click", toggleSound);
  els.playAgain.addEventListener("click", resetGame);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.letterModal.hidden) closeLetterModal();
  });
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function chooseNextColor() {
  const available = [...new Set(objects.filter((object) => !state.foundIds.has(object.id)).map((object) => object.color))];
  if (!available.length) {
    showWinScreen();
    return;
  }
  const alternatives = available.filter((color) => color !== state.currentColor);
  state.currentColor = randomItem(alternatives.length ? alternatives : available);
  els.colorWord.textContent = `${colorNames[state.currentColor]}!`;
}

function handleObjectSelection(objectId) {
  if (state.inputLocked || state.foundIds.has(objectId)) return;
  const object = objects.find((item) => item.id === objectId);
  if (!object) return;
  ensureAudioContext();
  startBackgroundMusic();

  if (object.color !== state.currentColor) {
    playErrorSound();
    showWrongFeedback(objectId);
    return;
  }

  state.inputLocked = true;
  state.pendingObjectId = objectId;
  state.modalReturnFocus = document.activeElement;
  playSuccessSound();
  openLetterModal(object.letter);
}

function showWrongFeedback(objectId) {
  const hotspot = els.hotspotLayer.querySelector(`[data-id="${objectId}"]`);
  els.questionCard.classList.remove("shake");
  hotspot?.classList.remove("wrong");
  void els.questionCard.offsetWidth;
  els.questionCard.classList.add("shake");
  hotspot?.classList.add("wrong");
  window.setTimeout(() => {
    els.questionCard.classList.remove("shake");
    hotspot?.classList.remove("wrong");
  }, 360);
}

function openLetterModal(letter) {
  els.letter.textContent = letter;
  els.letter.style.setProperty("--letter-hue", String((letter.charCodeAt(0) * 47) % 360));
  els.letterModal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => els.closeModal.focus(), 0);
}

function closeLetterModal() {
  if (els.letterModal.hidden || !state.pendingObjectId) return;
  const objectId = state.pendingObjectId;
  els.letterModal.hidden = true;
  document.body.style.overflow = "";
  markObjectAsFound(objectId);
  state.pendingObjectId = null;
  updateProgress();

  if (state.foundIds.size === objects.length) {
    showWinScreen();
  } else {
    chooseNextColor();
    state.inputLocked = false;
    const nextFocusable = [...els.hotspotLayer.querySelectorAll(".hotspot")].find((node) => node.tabIndex === 0);
    if (state.modalReturnFocus?.isConnected && state.modalReturnFocus.tabIndex === 0) state.modalReturnFocus.focus();
    else nextFocusable?.focus();
  }
}

function markObjectAsFound(objectId) {
  const object = objects.find((item) => item.id === objectId);
  if (!object || state.foundIds.has(objectId)) return;
  state.foundIds.add(objectId);
  const hotspot = els.hotspotLayer.querySelector(`[data-id="${objectId}"]`);
  if (hotspot) {
    hotspot.style.pointerEvents = "none";
    hotspot.setAttribute("tabindex", "-1");
    hotspot.setAttribute("aria-disabled", "true");
  }
  renderFoundOverlay(object);
}

function renderFoundOverlay(object) {
  const clipId = `clip-${object.id}`;
  const clip = document.createElementNS(SVG_NS, "clipPath");
  clip.setAttribute("id", clipId);
  clip.dataset.foundClip = object.id;
  clip.append(createShape(object));
  els.defs.append(clip);

  const group = document.createElementNS(SVG_NS, "g");
  group.dataset.foundOverlay = object.id;

  const image = document.createElementNS(SVG_NS, "image");
  image.setAttribute("href", SCENE_PATH);
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", "1408");
  image.setAttribute("height", "768");
  image.setAttribute("preserveAspectRatio", "none");
  image.setAttribute("clip-path", `url(#${clipId})`);
  image.setAttribute("class", "found-image");
  group.append(image);

  const shade = createShape(object, "found-shade");
  group.append(shade);

  const { x, y } = getCenter(object);
  const size = getCrossSize(object);
  const d = `M ${x - size} ${y - size} L ${x + size} ${y + size} M ${x + size} ${y - size} L ${x - size} ${y + size}`;
  const outline = document.createElementNS(SVG_NS, "path");
  outline.setAttribute("d", d);
  outline.setAttribute("class", "cross-outline");
  const mark = document.createElementNS(SVG_NS, "path");
  mark.setAttribute("d", d);
  mark.setAttribute("class", "cross-mark");
  group.append(outline, mark);
  els.foundLayer.append(group);
}

function updateProgress() {
  els.progress.textContent = `Найдено: ${state.foundIds.size} / ${objects.length}`;
}

function ensureAudioContext() {
  if (!state.soundEnabled) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!state.audioContext) state.audioContext = new AudioContext();
  if (state.audioContext.state === "suspended") state.audioContext.resume();
  return state.audioContext;
}

function playTone(frequency, start, duration, volume = .055, type = "sine") {
  const context = ensureAudioContext();
  if (!context || !state.soundEnabled) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + start);
  gain.gain.setValueAtTime(.0001, context.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + start + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(context.currentTime + start);
  oscillator.stop(context.currentTime + start + duration + .02);
}

function playErrorSound() {
  playTone(260, 0, .15, .045, "triangle");
  playTone(175, .14, .2, .045, "triangle");
}

function playSuccessSound() {
  playTone(440, 0, .14, .05);
  playTone(660, .12, .2, .05);
}

function playWinSound() {
  [523, 659, 784, 1047].forEach((frequency, index) => playTone(frequency, index * .1, .24, .045));
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  els.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
  els.soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
  els.soundLabel.textContent = state.soundEnabled ? "Музыка и звук включены" : "Музыка и звук выключены";
  if (state.soundEnabled) {
    startBackgroundMusic();
    playTone(520, 0, .1, .035);
  } else {
    els.backgroundMusic.pause();
  }
}

function startBackgroundMusic() {
  if (!state.soundEnabled || !els.backgroundMusic.paused) return;
  els.backgroundMusic.volume = .2;
  const playPromise = els.backgroundMusic.play();
  if (playPromise) playPromise.catch(() => {});
}

function showWinScreen() {
  state.inputLocked = true;
  els.winScore.textContent = `Найдено предметов: ${objects.length}`;
  els.winModal.hidden = false;
  document.body.style.overflow = "hidden";
  playWinSound();
  window.setTimeout(() => els.playAgain.focus(), 0);
}

function resetGame() {
  state.currentColor = null;
  state.pendingObjectId = null;
  state.inputLocked = false;
  state.foundIds.clear();
  state.modalReturnFocus = null;
  els.winModal.hidden = true;
  document.body.style.overflow = "";
  els.foundLayer.replaceChildren();
  els.defs.querySelectorAll("[data-found-clip]").forEach((clip) => clip.remove());
  els.hotspotLayer.querySelectorAll(".hotspot").forEach((hotspot) => {
    hotspot.style.pointerEvents = "";
    hotspot.setAttribute("tabindex", "0");
    hotspot.removeAttribute("aria-disabled");
  });
  updateProgress();
  chooseNextColor();
}

if (els.image.complete && els.image.naturalWidth) initGame();
else {
  els.image.addEventListener("load", initGame, { once: true });
  els.image.addEventListener("error", () => {
    els.loading.textContent = "Не удалось загрузить картинку. Проверьте файл assets/scene.png";
  }, { once: true });
}
