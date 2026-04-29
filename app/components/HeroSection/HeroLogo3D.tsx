"use client";

import { Waves } from "./Waves";

const LOGO_ASPECT = 2000 / 1283;
const FEATHER = 4;

const LOGO_PATH =
  "M4605 12823 c-846 -24 -1745 -317 -2475 -806 -908 -608 -1593 -1523 -1914 -2557 -100 -322 -152 -581 -198 -985 -17 -149 -17 -713 0 -875 69 -654 222 -1177 508 -1740 546 -1074 1495 -1912 2634 -2327 485 -177 1057 -283 1525 -283 l141 0 43 178 c24 97 106 431 183 742 377 1528 408 1654 405 1655 -1 1 -85 12 -187 24 -424 51 -821 133 -1088 225 -150 52 -376 161 -502 243 -437 284 -760 738 -880 1237 -42 175 -54 285 -53 486 0 215 14 324 62 511 185 717 754 1283 1474 1468 269 70 79 65 2576 68 1240 2 2257 0 2261 -4 4 -4 -23 -129 -60 -278 -37 -148 -115 -463 -173 -700 -59 -236 -165 -666 -236 -955 -71 -289 -163 -662 -205 -830 -141 -575 -265 -1075 -371 -1505 -58 -236 -142 -574 -185 -750 -43 -176 -127 -513 -185 -750 -58 -236 -147 -593 -196 -792 -197 -800 -272 -1106 -368 -1493 -177 -718 -268 -1085 -381 -1545 -61 -248 -112 -456 -115 -462 -3 -10 283 -13 1409 -13 l1413 0 71 288 c69 275 237 956 396 1602 41 168 125 508 186 755 61 248 147 594 190 770 43 176 126 511 184 745 57 234 145 589 195 790 101 412 232 941 381 1545 56 226 137 554 180 730 420 1705 533 2161 624 2525 l81 325 2708 3 c1489 1 2707 -1 2707 -4 0 -3 -96 -101 -213 -218 -327 -323 -503 -513 -805 -864 -620 -722 -1210 -1545 -1720 -2399 -1154 -1931 -1975 -4095 -2442 -6436 -17 -81 -30 -150 -30 -153 0 -2 630 -4 1400 -4 l1400 0 5 23 c225 984 462 1768 803 2652 83 216 205 511 278 673 13 29 24 54 24 57 0 2 23 51 50 110 28 59 50 108 50 110 0 14 286 596 396 806 416 791 906 1559 1345 2106 317 396 697 813 1101 1208 346 339 737 684 916 809 l72 50 0 2108 0 2108 -7652 -2 c-4209 -1 -7693 -3 -7743 -5z";

const FEATHERED_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1283" preserveAspectRatio="xMidYMid meet"><defs><filter id="f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${FEATHER}"/></filter></defs><g transform="translate(0 1283) scale(0.1 -0.1)" filter="url(#f)"><path d="${LOGO_PATH}" fill="white"/></g></svg>`
)}")`;

export default function HeroLogo3D() {
  return (
    <div aria-hidden className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
      <div
        style={{
          width: "min(40vw, 80vh, 800px)",
          aspectRatio: `${LOGO_ASPECT}`,
        }}
      >
        <div
          role="img"
          aria-label="9TSEVEN"
          className="relative w-full h-full"
          style={{
            opacity: 0.9,
            WebkitMaskImage: FEATHERED_MASK,
            maskImage: FEATHERED_MASK,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        >
          <Waves backgroundColor="transparent" strokeColor="#ffffff" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}
