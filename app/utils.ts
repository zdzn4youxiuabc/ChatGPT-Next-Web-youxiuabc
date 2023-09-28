import { useEffect, useState } from "react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";

export function trimTopic(topic: string) {
  return topic.replace(/[，。！？”“"、,.!?]*$/, "");
}
export async function SpeechText(text: string, i: any) {
  const SPEECH_URL = `https://api.youxiuabc.com/api/ai/longSpeech?content=${text}`;
  fetch(SPEECH_URL)
    .then((res) => res.json())
    .then((res) => {
      const audio = new Audio(res.data.path);
      audio.play();
      // 获取它的节点
      const sty = document.getElementsByClassName("markdown-body");
      const bo = sty[i];
      const subText = res.data.subtitles;
      let t = "";
      // 返回字段根据状态把节点数据更换
      subText.forEach((res: any) => {
        const sub = `<span style="color: red">${res.text}</span>` + "&nbsp;";
        // 再以循环的形式以1000m来进行输出，更换颜色
        setTimeout(function () {
          bo.innerHTML = t += sub;
        }, res.end_time - res.begin_time);
      });
    });
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
