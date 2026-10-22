export function setupFrameStudy() {
  const root = document.querySelector<HTMLElement>("[data-frame-experiment]")!;
  const video = root.querySelector<HTMLVideoElement>("[data-frame-video]")!;
  const select = root.querySelector<HTMLSelectElement>("[data-film-select]")!;
  const range = root.querySelector<HTMLInputElement>("[data-frame-range]")!;
  const output = root.querySelector<HTMLOutputElement>("[data-frame-time]")!;
  const play = root.querySelector<HTMLButtonElement>("[data-frame-play]")!;
  const load = root.querySelector<HTMLButtonElement>("[data-frame-load]")!;
  const status = root.querySelector<HTMLElement>("[data-frame-status]")!;
  const steps = root.querySelectorAll<HTMLButtonElement>("[data-frame-step]");
  let ready = false;
  let frameRate = 24;
  let loadTimer: ReturnType<typeof setTimeout> | undefined;
  const formatTime = (time: number) =>
    `${String(Math.floor(time / 60)).padStart(2, "0")}:${(time % 60).toFixed(2).padStart(5, "0")}`;
  const setEnabled = (enabled: boolean) => {
    range.disabled = !enabled;
    play.disabled = !enabled;
    steps.forEach((button) => {
      button.disabled = !enabled;
    });
  };
  const updatePosition = () => {
    range.value = String(video.currentTime);
    output.value = formatTime(video.currentTime);
    range.setAttribute(
      "aria-valuetext",
      `${video.currentTime.toFixed(2)} seconds`,
    );
  };
  function setStudy() {
    clearTimeout(loadTimer);
    video.pause();
    ready = false;
    setEnabled(false);
    const option = select.selectedOptions[0];
    frameRate = Number(option.dataset.fps);
    video.preload = "none";
    video.src = option.dataset.src!;
    video.poster = option.dataset.poster!;
    video.setAttribute("aria-label", `${option.textContent}, silent film`);
    range.max = String(Number(option.dataset.duration) - 1 / frameRate);
    range.step = String(1 / frameRate);
    range.value = "0";
    output.value = "00:00.00";
    load.hidden = false;
    load.disabled = false;
    load.textContent = "Load frame controls ↗";
    play.textContent = "Play";
    const link = root.querySelector<HTMLAnchorElement>("[data-study-link]")!;
    link.href = `/work/${option.value}/`;
    status.textContent =
      "Use the video controls to watch. Load the frame controls to explore individual moments.";
  }
  const initial = new URLSearchParams(location.search).get("project");
  if (initial && [...select.options].some((option) => option.value === initial))
    select.value = initial;
  setStudy();
  root.querySelector<HTMLElement>("[data-frame-controls]")!.hidden = false;
  select.addEventListener("change", () => {
    setStudy();
    const url = new URL(location.href);
    url.searchParams.set("project", select.value);
    history.replaceState(null, "", url);
  });
  const fail = () => {
    clearTimeout(loadTimer);
    ready = false;
    setEnabled(false);
    load.hidden = false;
    load.disabled = false;
    load.textContent = "Retry loading film ↗";
    status.textContent =
      "The film could not load. Try again, or use “View project” to explore the stills.";
  };
  load.addEventListener("click", () => {
    load.disabled = true;
    status.textContent = "Loading the film for frame exploration…";
    video.preload = "auto";
    video.load();
    clearTimeout(loadTimer);
    loadTimer = setTimeout(fail, 30000);
  });
  video.addEventListener("loadeddata", () => {
    clearTimeout(loadTimer);
    if (!Number.isFinite(video.duration) || video.duration <= 0) return fail();
    ready = true;
    range.max = String(Math.max(0, video.duration - 1 / frameRate));
    setEnabled(true);
    load.hidden = true;
    status.textContent = `${select.selectedOptions[0].textContent} is ready. Use the slider or frame buttons to explore.`;
  });
  video.addEventListener("error", fail);
  video.addEventListener("timeupdate", updatePosition);
  video.addEventListener("seeked", updatePosition);
  video.addEventListener("play", () => {
    play.textContent = "Pause";
  });
  video.addEventListener("pause", () => {
    play.textContent = "Play";
  });
  video.addEventListener("ended", () => {
    play.textContent = "Play";
  });
  range.addEventListener("input", () => {
    if (!ready) return;
    video.pause();
    video.currentTime = Number(range.value);
    output.value = formatTime(Number(range.value));
  });
  steps.forEach((button) =>
    button.addEventListener("click", () => {
      if (!ready) return;
      video.pause();
      video.currentTime = Math.max(
        0,
        Math.min(
          Number(range.max),
          video.currentTime + Number(button.dataset.frameStep) / frameRate,
        ),
      );
    }),
  );
  play.addEventListener("click", async () => {
    if (!ready) return;
    if (!video.paused) video.pause();
    else {
      try {
        await video.play();
      } catch {
        status.textContent =
          "Playback was interrupted. Use the film’s native play button to continue.";
      }
    }
  });
  addEventListener("pagehide", () => {
    clearTimeout(loadTimer);
    video.pause();
  });
}
