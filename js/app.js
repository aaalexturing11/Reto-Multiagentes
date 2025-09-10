
let unityInstance = null;

const buildUrl = "Build";
const config = {
  dataUrl: buildUrl + "/Build.data",
  frameworkUrl: buildUrl + "/Build.framework.js",
  codeUrl: buildUrl + "/Build.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "Equipo",
  productName: "Cruce",
  productVersion: "1.0",
};


const canvas = document.getElementById("unity-canvas");
const loading = document.getElementById("unity-loading");
const progress = document.getElementById("unity-progress");
const statusBox = document.getElementById("statusBox");

window.addEventListener("load", () => {
  if (typeof createUnityInstance !== "function") {
    statusBox.textContent = "Loader de Unity no encontrado";
    statusBox.className = "status-pill status-err";
    return;
  }
  createUnityInstance(canvas, config, (p) => {

    progress.textContent = Math.round(p * 100) + "%";
  })
    .then((instance) => {
      unityInstance = instance;
      loading.style.display = "none";
      statusBox.textContent = "WebGL listo";
      statusBox.className = "status-pill status-ok";
      bindUI();

      pushAll();
    })
    .catch((e) => {
      console.error(e);
      statusBox.textContent = "Error al cargar WebGL";
      statusBox.className = "status-pill status-err";
    });
});


const $ = (sel) => document.querySelector(sel);
const slGMain   = $("#slGMain");
const slGInd    = $("#slGInd");
const slY       = $("#slY");
const slAR      = $("#slAR");
const slLamMain = $("#slLamMain");
const slLamInd  = $("#slLamInd");

const valGMain   = $("#valGMain");
const valGInd    = $("#valGInd");
const valY       = $("#valY");
const valAR      = $("#valAR");
const valLamMain = $("#valLamMain");
const valLamInd  = $("#valLamInd");

const btnReload = $("#btnReload");
const camA = $("#camA"), camB = $("#camB"), camC = $("#camC");

const statDelay = $("#stat-delay");
const statQueue = $("#stat-queue");
const statThru  = $("#stat-thru");

function debounce(fn, ms=150){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), ms);
  };
}

function uiToLabels() {
  valGMain.textContent   = `${slGMain.value} s`;
  valGInd.textContent    = `${slGInd.value} s`;
  valY.textContent       = `${slY.value} s`;
  valAR.textContent      = `${slAR.value} s`;
  valLamMain.textContent = Number(slLamMain.value).toFixed(3);
  valLamInd.textContent  = Number(slLamInd.value).toFixed(3);
}

function sendToUnity(method, value) {
  if (!unityInstance) return;

  unityInstance.SendMessage("Bridge", method, String(value));
}

const pushAll = debounce(()=>{
  sendToUnity("SetGreenMain", slGMain.value);
  sendToUnity("SetGreenInd",  slGInd.value);
  sendToUnity("SetYellow",    slY.value);
  sendToUnity("SetAllRed",    slAR.value);
  sendToUnity("SetLamMain",   slLamMain.value);
  sendToUnity("SetLamInd",    slLamInd.value);
}, 50);

function bindUI(){

  [slGMain, slGInd, slY, slAR, slLamMain, slLamInd].forEach(el=>{
    el.addEventListener("input", ()=>{
      uiToLabels();
      pushAll();
    });
  });

  camA.addEventListener("click", ()=> sendToUnity("SetCamera","A"));
  camB.addEventListener("click", ()=> sendToUnity("SetCamera","B"));
  camC.addEventListener("click", ()=> sendToUnity("SetCamera","C"));

  btnReload.addEventListener("click", ()=> location.reload());

  uiToLabels();
}

window.UpdateKPIs = function(delayProxy, maxQueue, throughput){
  statDelay.textContent = delayProxy;
  statQueue.textContent = maxQueue;
  statThru.textContent  = throughput;
};

// En tu HTML añade un div donde mostrar el tiempo:
{/* <div class="stat">
     <div class="num" id="stat-time">00:00:00</div>
     <div class="label">Tiempo simulado</div>
</div> */}

const statTime = document.getElementById("stat-time");

// Unity → JS
window.UpdateSimTime = function(formatted){
  statTime.textContent = formatted;
};

const slSpeed   = document.getElementById("slSpeed");
const valSpeed  = document.getElementById("valSpeed");

slSpeed.addEventListener("input", () => {
  valSpeed.textContent = slSpeed.value + "x";
  if (unityInstance) {
    unityInstance.SendMessage("Bridge", "SetSimSpeed", slSpeed.value);
  }
});
