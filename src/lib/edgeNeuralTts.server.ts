/**
 * AYXA Muse Pro — Studio-Grade Microsoft Edge Natural Feminine Neural TTS Engine
 * Synthesizes 24kHz 48kbps MP3 audio using dedicated natural female neural voices
 * for every Arabic dialect and international language, with zero API keys required.
 */

import tls from "node:tls";
import crypto from "node:crypto";

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const CHROMIUM_MAJOR_VERSION = "143";
const SEC_MS_GEC_VERSION = `2-${CHROMIUM_FULL_VERSION}`;
const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;
const U32_MASK = 0xffffffff;

/**
 * Luxury Natural Feminine Neural Voices per Arabic Dialect & World Language
 */
export const FEMININE_NEURAL_VOICE_MAP: Record<string, string> = {
  "ar-MA": "ar-MA-MounaNeural", // Moroccan Darija — Mouna (Female)
  "ar-SA": "ar-SA-ZariyahNeural", // Saudi / Gulf — Zariyah (Female)
  "ar-EG": "ar-EG-SalmaNeural", // Egyptian — Salma (Female)
  "ar-LB": "ar-LB-LaylaNeural", // Lebanese / Levantine — Layla (Female)
  "ar-AE": "ar-AE-FatimaNeural", // Emirati — Fatima (Female)
  "ar-DZ": "ar-DZ-AminaNeural", // Algerian — Amina (Female)
  "ar-TN": "ar-TN-ReemNeural", // Tunisian — Reem (Female)
  "ar-IQ": "ar-IQ-RanaNeural", // Iraqi — Rana (Female)
  "ar-KW": "ar-KW-NouraNeural", // Kuwaiti — Noura (Female)
  "ar-QA": "ar-QA-AmalNeural", // Qatari — Amal (Female)
  "ar-JO": "ar-JO-SanaNeural", // Jordanian — Sana (Female)
  "ar-SY": "ar-SY-AmanyNeural", // Syrian — Amany (Female)
  "ar-fusha": "ar-SA-ZariyahNeural", // Modern Standard Arabic — Zariyah (Female)
  ar: "ar-SA-ZariyahNeural",
  "fr-FR": "fr-FR-DeniseNeural", // French — Denise (Female)
  fr: "fr-FR-DeniseNeural",
  "es-ES": "es-ES-ElviraNeural", // Spanish — Elvira (Female)
  es: "es-ES-ElviraNeural",
  "de-DE": "de-DE-KatjaNeural", // German — Katja (Female)
  de: "de-DE-KatjaNeural",
  "tr-TR": "tr-TR-EmelNeural", // Turkish — Emel (Female)
  tr: "tr-TR-EmelNeural",
  "it-IT": "it-IT-ElsaNeural", // Italian — Elsa (Female)
  it: "it-IT-ElsaNeural",
  "pt-BR": "pt-BR-FranciscaNeural", // Portuguese — Francisca (Female)
  pt: "pt-BR-FranciscaNeural",
  "ru-RU": "ru-RU-SvetlanaNeural", // Russian — Svetlana (Female)
  ru: "ru-RU-SvetlanaNeural",
  "en-US": "en-US-AriaNeural", // English — Aria (Luxury Female)
  en: "en-US-AriaNeural",
};

export function selectNeuralVoiceForLang(langOrDialect: string): string {
  const clean = (langOrDialect || "ar").trim();
  if (FEMININE_NEURAL_VOICE_MAP[clean]) {
    return FEMININE_NEURAL_VOICE_MAP[clean];
  }
  const base = clean.split("-")[0].toLowerCase();
  return FEMININE_NEURAL_VOICE_MAP[base] || "ar-SA-ZariyahNeural";
}

// ============================================================================
// Sec-MS-GEC v2 Token Generator (Ported from edge-tts 7.3.1 drm.py)
// ============================================================================

const SHA256_INITIAL = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];
const SHA256_STATE = [
  0xfd9fbea2, 0x91243ce7, 0xbe499094, 0xcd2e1e0a,
  0x6c006f49, 0x04bd35ab, 0xfeb0a7e4, 0x03effbd2,
];
const SHA256_SCHEDULE = [
  0xeb24bf9e, 0x1558691f, 0xa0c09ee2, 0x0cfa32ba,
  0xa622ee8c, 0xd1dd9491, 0xc0dd25a0, 0xf9e70ab6,
  0xf0c31573, 0x7058ce4e, 0x7188e606, 0x00e5ab33,
  0xd258b060, 0x72766564,
];
const SHA256_ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const SHA256_ADJUSTMENT = 0xc9dc06a7;
const SHA256_BLOCK_CONSTANTS = [
  ...SHA256_ROUND_CONSTANTS.slice(0, 14),
  SHA256_ADJUSTMENT,
  ...SHA256_ROUND_CONSTANTS.slice(15),
];
const SHA256_SIGMA0_ADJUSTMENT = 0x059c0b80;
const SHA256_SIGMA1_ADJUSTMENT = 0x000b92c0;

const CS64_COEFFICIENTS: Array<[number, number]> = [
  [0xe82e91b1, 0xb32700d0],
  [0x44de24c6, 0x88dff51d],
  [0x3beb65bc, 0x29514038],
  [0xc89c5933, 0xb328cbdf],
  [0x8d1ec211, 0xd405b4d5],
  [0x314ef5d5, 0x26e55f3c],
  [0xe92491b1, 0x607801c6],
  [0xf0a5b9d5, 0x82b2c1fb],
  [0x06064cf3, 0xfa51a3da],
  [0xda79fa60, 0x207cc464],
  [0xbed20560, 0x3c3c74f3],
  [0x89f9c9f8, 0xd2d14b61],
  [0x35fa38c6, 0xbb04a2c1],
  [0xcb49e3c6, 0xc5626167],
];
const CS64_FACTOR = 0x82893933;
const CS64_ADJUSTMENT0 = 0xf2f90b1a;
const CS64_ADJUSTMENT1 = 0x0b1a0000;

function u32(v: number | bigint): number {
  return Number(BigInt(v) & 0xffffffffn);
}

function mul32(a: number, b: number): number {
  return Number((BigInt(a >>> 0) * BigInt(b >>> 0)) & 0xffffffffn);
}

function rol16(value: number): number {
  const v = value >>> 0;
  return (((v << 16) | (v >>> 16)) >>> 0);
}

function rotr32(v: number, n: number): number {
  const u = v >>> 0;
  return (((u >>> n) | (u << (32 - n))) >>> 0);
}

function sigma0(value: number): number {
  const v = value >>> 0;
  return ((rotr32(v, 7) ^ rotr32(v, 18) ^ (v >>> 3)) >>> 0);
}

function sigma1(value: number): number {
  const v = value >>> 0;
  return ((rotr32(v, 17) ^ rotr32(v, 19) ^ (v >>> 10)) >>> 0);
}

function sha256Rounds(state: number[], words: number[], firstRound = 0): number[] {
  let [a, b, c, d, e, f, g, h] = state.map((x) => x >>> 0);
  const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS;
  for (let i = firstRound; i < 64; i++) {
    const s1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
    const ch = (e & f) ^ ((~e) & g);
    const t1 = u32(BigInt(h) + BigInt(s1 >>> 0) + BigInt(ch >>> 0) + BigInt(constants[i] >>> 0) + BigInt(words[i] >>> 0));
    const s0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const t2 = u32(BigInt(s0 >>> 0) + BigInt(maj >>> 0));
    h = g;
    g = f;
    f = e;
    e = u32(BigInt(d) + BigInt(t1));
    d = c;
    c = b;
    b = a;
    a = u32(BigInt(t1) + BigInt(t2));
  }
  return [a, b, c, d, e, f, g, h];
}

function expandSha256Schedule(words: number[], firstWord = 16): void {
  for (let i = firstWord; i < 64; i++) {
    const s1 = sigma1(words[i - 2]);
    const s0 = sigma0(words[i - 15]);
    words.push(u32(BigInt(s1) + BigInt(words[i - 7] >>> 0) + BigInt(s0) + BigInt(words[i - 16] >>> 0)));
  }
}

function sha256Init(data7: Buffer): number[] {
  const words: number[] = new Array(14).fill(0);
  words.push((data7[0] << 16) | (data7[1] << 8) | data7[2]);
  words.push(data7.readUInt32BE(3));
  for (let index = 16; index < 30; index++) {
    let val = BigInt(SHA256_SCHEDULE[index - 16] >>> 0);
    if (index - 2 >= 14) {
      const s1 = sigma1(words[index - 2]);
      val += BigInt((index === 16 ? (s1 ^ SHA256_SIGMA1_ADJUSTMENT) : s1) >>> 0);
    }
    if (index - 7 >= 14) {
      val += BigInt(words[index - 7] >>> 0);
    }
    if (index - 15 >= 14) {
      const s0 = sigma0(words[index - 15]);
      val += BigInt((index === 29 ? (s0 ^ SHA256_SIGMA0_ADJUSTMENT) : s0) >>> 0);
    }
    words.push(u32(val));
  }
  words.push(
    u32(
      BigInt(sigma1(words[28])) +
        BigInt(words[23] >>> 0) +
        BigInt(sigma0(words[15])) +
        BigInt(words[14] >>> 0) +
        BigInt(SHA256_ADJUSTMENT >>> 0) -
        BigInt(SHA256_ROUND_CONSTANTS[14] >>> 0)
    )
  );
  expandSha256Schedule(words, 31);
  const working = sha256Rounds(SHA256_STATE, words, 14);
  return SHA256_INITIAL.map((x, idx) => u32(BigInt(x >>> 0) + BigInt(working[idx] >>> 0)));
}

function sha256Digest(data: Buffer): Buffer {
  const length = 57 + data.length;
  const tail = data.subarray(7);
  const zeroPadLen = (((55 - length) % 64) + 64) % 64;
  const lenBuf = Buffer.alloc(8);
  lenBuf.writeBigUInt64BE(BigInt(length * 8), 0);
  const padded = Buffer.concat([tail, Buffer.from([0x80]), Buffer.alloc(zeroPadLen), lenBuf]);

  let state = sha256Init(data.subarray(0, 7));
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words: number[] = [];
    for (let j = 0; j < 16; j++) {
      words.push(padded.readUInt32BE(offset + j * 4));
    }
    expandSha256Schedule(words);
    const working = sha256Rounds(state, words);
    state = state.map((x, idx) => u32(BigInt(x >>> 0) + BigInt(working[idx] >>> 0)));
  }
  const out = Buffer.alloc(32);
  state.forEach((w, idx) => out.writeUInt32BE(w >>> 0, idx * 4));
  return out;
}

function wordsLe4Even(data: Buffer): number[] {
  const rem = (4 - (data.length % 4)) % 4;
  const padded = rem > 0 ? Buffer.concat([data, Buffer.alloc(rem)]) : data;
  const words: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    words.push(padded.readUInt32LE(i));
  }
  if (words.length % 2 !== 0) {
    words.push(0);
  }
  return words;
}

function cs64Digest(data: Buffer, digest: Buffer): [number, number] {
  const keyA = (digest.readUInt32LE(0) | 1) >>> 0;
  const keyB = (digest.readUInt32LE(4) | 1) >>> 0;
  const factors = [mul32(keyA, CS64_FACTOR), mul32(keyB, CS64_FACTOR)];
  const terms: number[] = CS64_COEFFICIENTS.map(([coeff], idx) => mul32(coeff, factors[idx % 2]));
  const offsets: number[] = CS64_COEFFICIENTS.map(([, off]) => off >>> 0);

  const inputWords = wordsLe4Even(Buffer.concat([Buffer.from([0x00]), data]));
  inputWords.forEach((word, index) => {
    let term = BigInt(word >>> 0) * BigInt((index % 2 === 0 ? keyA : keyB) >>> 0);
    let offset = BigInt(rol16(word)) * BigInt(index % 2 === 0 ? 0xef0569fb : 0xc31713db);
    if (index === 0) {
      term += BigInt(CS64_ADJUSTMENT0) * BigInt(factors[0] >>> 0);
      offset += BigInt(CS64_ADJUSTMENT1);
    }
    terms.push(u32(term));
    offsets.push(u32(offset));
  });

  let swapAcc = 0;
  let swapLast = 0;
  let state = 0;
  let acc = 0;

  for (let index = 0; index < terms.length; index += 2) {
    const x = terms[index] >>> 0;
    const y = terms[index + 1] >>> 0;
    let t = rol16(u32(BigInt(offsets[index]) + BigInt(x)));
    let q = mul32(t, 0x76f50f34);
    swapAcc = u32(BigInt(swapAcc) + ((BigInt(rol16(q)) * 0xc3efea97n + BigInt(q)) & 0xffffffffn));

    t = rol16(u32(BigInt(offsets[index + 1]) + BigInt(y)));
    q = mul32(t, 0x1881ce3c);
    swapLast = u32(BigInt(rol16(q)) * 0x35bd1ec9n + BigInt(q));
    swapAcc = u32(BigInt(swapAcc) + BigInt(swapLast));

    state = u32(BigInt(state) * BigInt(keyA) + BigInt(x));
    state = mul32(rol16(state), 0xcf98b111);
    state = mul32(rol16(state), 0x87085b9f);
    state = mul32(rol16(state), 0x12ceb96d);
    state = mul32(rol16(state), 0x257e1d83);
    acc = u32(BigInt(acc) + BigInt(state));

    t = u32(BigInt(state) * BigInt(keyB) + BigInt(y));
    t = mul32(rol16(t), 0xa27416f5);
    t = mul32(rol16(t), 0xd38396ff);
    state = mul32(rol16(mul32(rol16(t), 0x7c932b89)), 0xbfa49f69);
    acc = u32(BigInt(acc) + BigInt(state));
  }

  return [(swapLast ^ state) >>> 0, (swapAcc ^ acc) >>> 0];
}

export function generateSecMsGecV2(unixSeconds = Date.now() / 1000): string {
  let ticks = Math.floor(unixSeconds) + WIN_EPOCH;
  ticks -= ticks % 300;
  const ticks100ns = BigInt(ticks) * 10000000n;
  const strToHash = Buffer.from(`${ticks100ns.toString()}${TRUSTED_CLIENT_TOKEN}`, "ascii");
  const digest = sha256Digest(strToHash);
  const [cs0, cs1] = cs64Digest(strToHash, digest);
  const csBuf = Buffer.alloc(8);
  csBuf.writeUInt32LE(cs0, 0);
  csBuf.writeUInt32LE(cs1, 4);
  return `${csBuf.toString("hex").toUpperCase()}-${digest.toString("hex").toUpperCase()}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function encodeWsTextFrame(text: string): Buffer {
  const payload = Buffer.from(text, "utf-8");
  const maskKey = crypto.randomBytes(4);
  const len = payload.length;
  let header: Buffer;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text frame
    header[1] = 0x80 | len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) {
    masked[i] = payload[i] ^ maskKey[i % 4];
  }
  return Buffer.concat([header, maskKey, masked]);
}

/**
 * Synthesizes speech using Microsoft Edge Natural Feminine Neural TTS over raw TLS WebSocket.
 */
export function synthesizeEdgeNeuralTts(params: {
  text: string;
  langOrDialect: string;
  pitch?: string;
  rate?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const cleanText = params.text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, " ").trim();
    if (!cleanText) {
      reject(new Error("Empty text"));
      return;
    }

    const voice = selectNeuralVoiceForLang(params.langOrDialect);
    const pitch = params.pitch || "+2Hz";
    const rate = params.rate || "+0%";

    const secMsGec = generateSecMsGecV2();
    const connectId = crypto.randomBytes(16).toString("hex");
    const muid = crypto.randomBytes(16).toString("hex").toUpperCase();
    const wsKey = crypto.randomBytes(16).toString("base64");
    const host = "speech.platform.bing.com";
    const path = `/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${connectId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;

    const socket = tls.connect(
      {
        host,
        port: 443,
        servername: host,
        timeout: 9000,
      },
      () => {
        const handshake =
          `GET ${path} HTTP/1.1\r\n` +
          `Host: ${host}\r\n` +
          `Cookie: muid=${muid};\r\n` +
          `Pragma: no-cache\r\n` +
          `Cache-Control: no-cache\r\n` +
          `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0\r\n` +
          `Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold\r\n` +
          `Upgrade: websocket\r\n` +
          `Connection: Upgrade\r\n` +
          `Sec-WebSocket-Key: ${wsKey}\r\n` +
          `Sec-WebSocket-Version: 13\r\n\r\n`;
        socket.write(handshake);
      }
    );

    let handshakeComplete = false;
    let rawBuffer: Buffer = Buffer.alloc(0);
    const mp3Chunks: Buffer[] = [];
    let finished = false;

    const finishWithError = (err: Error) => {
      if (finished) return;
      finished = true;
      try {
        socket.destroy();
      } catch {
        // Ignore destroy errors
      }
      reject(err);
    };

    const finishSuccess = () => {
      if (finished) return;
      finished = true;
      try {
        socket.destroy();
      } catch {
        // Ignore destroy errors
      }
      const total = Buffer.concat(mp3Chunks);
      if (total.length === 0) {
        reject(new Error("No neural audio bytes received"));
      } else {
        resolve(total);
      }
    };

    socket.setTimeout(9000, () => {
      finishWithError(new Error("Edge Neural TTS timed out"));
    });

    socket.on("error", (err) => {
      finishWithError(err);
    });

    socket.on("close", () => {
      if (!finished) {
        if (mp3Chunks.length > 0) finishSuccess();
        else finishWithError(new Error("Socket closed before audio arrived"));
      }
    });

    socket.on("data", (chunk: Buffer) => {
      rawBuffer = Buffer.concat([rawBuffer, chunk]);

      if (!handshakeComplete) {
        const headerEnd = rawBuffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;

        const headerStr = rawBuffer.subarray(0, headerEnd).toString("utf-8");
        if (!headerStr.startsWith("HTTP/1.1 101")) {
          finishWithError(new Error(`Handshake failed: ${headerStr.split("\r\n")[0]}`));
          return;
        }

        handshakeComplete = true;
        rawBuffer = rawBuffer.subarray(headerEnd + 4);

        const ts = new Date().toUTCString();
        const cmdMsg =
          `X-Timestamp:${ts}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;

        const reqId = crypto.randomBytes(16).toString("hex");
        const ssml =
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
          `<voice name='${voice}'>` +
          `<prosody pitch='${pitch}' rate='${rate}' volume='+0%'>` +
          `${escapeXml(cleanText)}` +
          `</prosody>` +
          `</voice>` +
          `</speak>`;

        const ssmlMsg =
          `X-RequestId:${reqId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${ts}Z\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml;

        socket.write(encodeWsTextFrame(cmdMsg));
        socket.write(encodeWsTextFrame(ssmlMsg));
      }

      // Parse incoming WebSocket frames
      while (rawBuffer.length >= 2) {
        const firstByte = rawBuffer[0];
        const secondByte = rawBuffer[1];
        const opcode = firstByte & 0x0f;
        const isMasked = (secondByte & 0x80) !== 0;
        let payloadLen = secondByte & 0x7f;
        let offset = 2;

        if (payloadLen === 126) {
          if (rawBuffer.length < 4) return;
          payloadLen = rawBuffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (rawBuffer.length < 10) return;
          payloadLen = Number(rawBuffer.readBigUInt64BE(2));
          offset = 10;
        }

        const maskOffset = isMasked ? 4 : 0;
        if (rawBuffer.length < offset + maskOffset + payloadLen) {
          return; // Wait for full frame
        }

        let framePayload = rawBuffer.subarray(
          offset + maskOffset,
          offset + maskOffset + payloadLen
        );
        if (isMasked) {
          const mask = rawBuffer.subarray(offset, offset + 4);
          const unmasked = Buffer.alloc(payloadLen);
          for (let i = 0; i < payloadLen; i++) {
            unmasked[i] = framePayload[i] ^ mask[i % 4];
          }
          framePayload = unmasked;
        }

        rawBuffer = rawBuffer.subarray(offset + maskOffset + payloadLen);

        if (opcode === 0x01) {
          // Text frame
          const txt = framePayload.toString("utf-8");
          if (txt.includes("Path:turn.end")) {
            finishSuccess();
            return;
          }
        } else if (opcode === 0x02) {
          // Binary frame (2-byte big-endian header length + header + MP3 audio data)
          if (framePayload.length > 2) {
            const headerLen = framePayload.readUInt16BE(0);
            if (framePayload.length > 2 + headerLen) {
              const headerText = framePayload.subarray(2, 2 + headerLen).toString("utf-8");
              if (headerText.includes("Path:audio")) {
                const audioBytes = framePayload.subarray(2 + headerLen);
                if (audioBytes.length > 0) {
                  mp3Chunks.push(Buffer.from(audioBytes));
                }
              }
            }
          }
        } else if (opcode === 0x08) {
          // Close frame
          finishSuccess();
          return;
        }
      }
    });
  });
}
