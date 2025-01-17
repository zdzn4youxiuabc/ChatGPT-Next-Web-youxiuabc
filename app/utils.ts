import { useEffect, useState } from "react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";

export function trimTopic(topic: string) {
  return topic.replace(/[，。！？”“"、,.!?]*$/, "");
}

function createMask() {
  var maskDiv = document.createElement("div");
  maskDiv.className = "mask-content";
  maskDiv.style.cssText =
    "height:100%;width:100%;position:fixed;_position:absolute;top:0;z-index:99999;background: rgba(0, 0, 0, 0.5);display: flex;align-items: center;justify-content: center;color: #fff;";
  maskDiv.textContent = "加载中...";
  document.body.appendChild(maskDiv);
}
function hideMask() {
  var mask = document.querySelector(".mask-content") as HTMLElement;
  if (mask) {
    mask.style.display = "none";
    document.body.removeChild(mask);
  }
}
export enum playType {
  play = 0,
  pause = 1,
  stop = 2,
}
let audio: any = null;
let id: any = null;
let timer: any = null;
let title: any = null;
let index = 0;
let lastIdx = "";
let lastTitle = "";
export const SpeechText = (text: string, i: any, cid: any, cb: any) => {
  setTimeout(() => {
    timer && clearInterval(timer);
    timer1 && clearInterval(timer1);
    console.log(1111111, timer1);
    if (id === cid) {
      cb(!audio.paused ? playType.pause : playType.play);
      if (audio.paused) {
        audio.play();
        scroll(title, i);
      } else {
        audio.pause();
        clearInterval(timer);
      }
      return;
    } else if (id && audio && lastIdx !== "") {
      id = null;
      audio.pause();
      audio = null;
      document.getElementsByClassName("markdown-body")[
        Number(lastIdx)
      ].innerHTML = lastTitle;
    }
    createMask();
    lastIdx = i;
    lastTitle = text;
    const SPEECH_URL = `https://api.youxiuabc.com/api/ai/longRestSpeech?content=${text}`;
    fetch(SPEECH_URL)
      .then((res) => res.json())
      .then((res) => {
        hideMask();
        audio = new Audio(res.data.path);
        audio.play();
        id = cid;
        audio.onended = () => {
          audio = null;
          timer && clearInterval(timer);
          timer1 && clearInterval(timer1);
          cb(2);
        };
        title = res.data.subtitles;
        index = 0;
        scroll(title, i);
      })
      .catch((err) => {
        hideMask();
      });
  }, 10);
};
let timer1: any = null;
function scroll(str: any, j: any) {
  const strCopy = JSON.parse(JSON.stringify(str));
  console.log(str);
  var msgArr: any[] = [];
  timer && clearInterval(timer);
  timer1 && clearInterval(timer1);
  timer = setInterval(() => {
    index += 1;
    const time = index * 100;
    if (time > str[str.length - 1].begin_time || !strCopy?.length) {
      clearInterval(timer);
    }
    if (time > str[0].begin_time) {
      const obj = strCopy.shift();
      msgArr.push(obj);
      const msg = msgArr.map((item: any) => item?.text).join("");
      const msg1 = strCopy.map((item: any) => item.text).join("");
      timer1 = setTimeout(() => {
        document.getElementsByClassName("markdown-body")[
          j
        ].innerHTML = `<span style="color: red">${msg}</span><span>${msg1}</span>`;
      }, obj.begin_time);
    }
  }, 500);
}

function scrollV1(str: any, j: any) {
  for (let i = 0; i < str.length; i++) {
    var msg = "";
    setTimeout(() => {
      msg += str[i].text + "&nbsp;";
      document.getElementsByClassName("markdown-body")[
        j
      ].innerHTML = `<span style="color: red">${msg}</span>`;
    }, 1500);
  }
}
export async function copyToClipboard(text: string) {
  try {
    if (window.__TAURI__) {
      window.__TAURI__.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }

    showToast(Locale.Copy.Success);
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(Locale.Copy.Success);
    } catch (error) {
      showToast(Locale.Copy.Failed);
    }
    document.body.removeChild(textArea);
  }
}

export function downloadAs(text: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function readFromFile() {
  return new Promise<string>((res, rej) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        res(e.target.result);
      };
      fileReader.onerror = (e) => rej(e);
      fileReader.readAsText(file);
    };

    fileInput.click();
  });
}

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}

export const MOBILE_MAX_WIDTH = 600;
export function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}

export function isFirefox() {
  return (
    typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent)
  );
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = window.getSelection();

  if (currentSelection?.type === "Range") {
    return false;
  }

  copyToClipboard(content);

  return true;
}

function getDomContentWidth(dom: HTMLElement) {
  const style = window.getComputedStyle(dom);
  const paddingWidth =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const width = dom.clientWidth - paddingWidth;
  return width;
}

function getOrCreateMeasureDom(id: string, init?: (dom: HTMLElement) => void) {
  let dom = document.getElementById(id);

  if (!dom) {
    dom = document.createElement("span");
    dom.style.position = "absolute";
    dom.style.wordBreak = "break-word";
    dom.style.fontSize = "14px";
    dom.style.transform = "translateY(-200vh)";
    dom.style.pointerEvents = "none";
    dom.style.opacity = "0";
    dom.id = id;
    document.body.appendChild(dom);
    init?.(dom);
  }

  return dom!;
}

export function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom("__measure");
  const singleLineDom = getOrCreateMeasureDom("__single_measure", (dom) => {
    dom.innerText = "TEXT_FOR_MEASURE";
  });

  const width = getDomContentWidth(dom);
  measureDom.style.width = width + "px";
  measureDom.innerText = dom.value !== "" ? dom.value : "1";
  measureDom.style.fontSize = dom.style.fontSize;
  const endWithEmptyLine = dom.value.endsWith("\n");
  const height = parseFloat(window.getComputedStyle(measureDom).height);
  const singleLineHeight = parseFloat(
    window.getComputedStyle(singleLineDom).height,
  );

  const rows =
    Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0);

  return rows;
}

export function getCSSVar(varName: string) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
}
