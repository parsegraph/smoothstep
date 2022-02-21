import {smoothlerp} from "./index";

const PRINT_TRAILERS = false;

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("demo");
  root.style.position = "relative";
  root.style.overflow = "hidden";

  const container = document.createElement("div");
  container.innerHTML = `${smoothlerp(0, 10, 0.5)}`;
  container.style.position = "absolute";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.pointerEvents = "none";
  root.appendChild(container);
  container.style.fontSize = "18px";
  container.style.fontFamily = "sans";

  const trailerCanvas = document.createElement("canvas");
  trailerCanvas.style.position = "absolute";
  trailerCanvas.style.left = "0px";
  trailerCanvas.style.right = "0px";
  trailerCanvas.style.top = "0px";
  trailerCanvas.style.bottom = "0px";
  trailerCanvas.style.zIndex = "0";
  const trailerCtx = trailerCanvas.getContext("2d");
  root.appendChild(trailerCanvas);

  const interval = 6000;

  let playing: Date = null;
  let lastPos: [number, number, string] = [0, 0, "rgb(255, 255, 255)"];

  const trailerDecay = 1.2;

    type Trailer = {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      duration: number;
      size: number;
      color: string;
      startTime: Date;
      inUse: boolean;
    };
  const trailers: Trailer[] = [];
  let trailerIndex = 0;
  for(let i = 0; i < 200; ++i) {
    trailers.push({
      inUse: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      duration: 0,
      size: 0,
      color: "",
      startTime: null,
    });
  }

  const moveContainer = () => {
    trailerCtx.globalCompositeOperation = 'destination-over';

    trailerIndex = 0;
    trailers.forEach(trailer=>{
      trailer.inUse = false;
    });

    const addTrailer = (
      startX: number,
      startY: number,
      color: string
    ) => {
      const trailer = trailers[trailerIndex++];
      trailer.inUse = true;
      trailer.startX = startX;
      trailer.startY = startY;
      trailer.color = color;
      trailer.startTime = new Date();
      trailer.duration = Math.random() * (interval - 1000);
      trailer.size = Math.floor(1 + 50 * Math.random());
      trailer.endX = Math.random() * root.clientWidth;
      trailer.endY = Math.random() * root.clientHeight;
    };
    playing = new Date();
    if (trailerCanvas.width !== root.clientWidth) {
      trailerCanvas.width = root.clientWidth;
    }
    if (trailerCanvas.height !== root.clientHeight) {
      trailerCanvas.height = root.clientHeight;
    }
    const rand = () => Math.floor(Math.random() * 255);
    document.body.style.backgroundColor = `rgb(${rand()}, ${rand()}, ${rand()})`;
    container.style.color = `rgb(${rand()}, ${rand()}, ${rand()})`;

    const x = Math.random() * root.clientWidth;
    const y = Math.random() * root.clientHeight;
    container.style.transform = `translate(${x}px, ${y}px)`;
    container.style.zIndex = "2";

    const minTrailers = 100;
    const numTrailers = Math.floor(minTrailers * Math.random());
    const bg = document.body.style.backgroundColor;
    if (lastPos) {
      for (let i = 0; i < Math.min(trailers.length, minTrailers + numTrailers); ++i) {
        addTrailer(...lastPos);
      }
    }
    lastPos = [x, y, bg];
    const animate = () => {
      if (!playing) {
        return;
      }
      trailerCtx.clearRect(0, 0, trailerCanvas.width, trailerCanvas.height);
      let needsUpdate = false;
      trailers.forEach((trailer) => {
        if (
          trailer.inUse &&
          Date.now() - trailer.startTime.getTime() >
          trailerDecay * trailer.duration
        ) {
          trailer.inUse = false;
        }
        if (!trailer.inUse) {
          return;
        }

        const { duration, size, startX, startY, endX, endY, color, startTime } =
          trailer;
        const elapsed = Math.min(
          trailerDecay * duration,
          Date.now() - startTime.getTime()
        );
        const pct = Math.min(1, elapsed / (trailerDecay * duration));
        trailerCtx.fillStyle = color;
        trailerCtx.beginPath();
        const curSize = smoothlerp(smoothlerp(1, size, Math.min(1, pct * 5)), 1, pct);
        trailerCtx.ellipse(
          smoothlerp(startX, endX, pct),
          smoothlerp(startY, endY, pct),
          curSize,
          curSize,
          0,
          0,
          2 * Math.PI
        );
        trailerCtx.fill();
        needsUpdate = pct < 1 || needsUpdate;
      });
      const pct = Math.min(interval, Date.now() - playing.getTime()) / interval;
      if (needsUpdate || pct < 1) {
        requestAnimationFrame(animate);
      }

      if (PRINT_TRAILERS) {
        trailerCtx.strokeStyle = "white";
        trailerCtx.fillStyle = "black";
        trailerCtx.textBaseline = "bottom";
        trailerCtx.textAlign = "right";
        trailerCtx.fillText(
          `trailers: ${trailers.length}`,
          trailerCanvas.width,
          trailerCanvas.height
        );
      }
    };
    requestAnimationFrame(animate);
  };

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.right = "8px";
  dot.style.top = "8px";
  dot.style.width = "16px";
  dot.style.height = "16px";
  dot.style.borderRadius = "8px";
  dot.style.transition = "background-color 400ms";
  dot.style.backgroundColor = "#222";
  root.appendChild(dot);

  container.style.transition = `color ${interval - 1000}ms, transform ${
    interval - 1000
  }ms, top ${interval - 1000}ms`;
  document.body.style.transition = `background-color ${interval - 1000}ms`;
  let timer: any = null;
  let dotTimer: any = null;
  let dotIndex = 0;
  const dotState = ["#f00", "#c00"];
  const refreshDot = () => {
    dotIndex = (dotIndex + 1) % dotState.length;
    dot.style.backgroundColor = dotState[dotIndex];
  };
  const dotInterval = 500;
  root.addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      clearInterval(dotTimer);
      dotTimer = null;
      dot.style.transition = "background-color 3s";
      dot.style.backgroundColor = "#222";
    } else {
      playing = new Date();
      trailerCanvas.width = root.clientWidth;
      trailerCanvas.height = root.clientHeight;
      moveContainer();
      dot.style.transition = "background-color 400ms";
      refreshDot();
      timer = setInterval(moveContainer, interval);
      dotTimer = setInterval(refreshDot, dotInterval);
    }
  });
});
