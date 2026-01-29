const hostname = window.location.hostname;
const isOtherDevice = hostname !== "localhost" && hostname !== "127.0.0.1";

export const API_URL = isOtherDevice? `http://${hostname}:8000` : "http://localhost:8000";

import wQ from "../assets/wQ.png";
import wR from "../assets/wR.png";
import wB from "../assets/wB.png";
import wN from "../assets/wN.png";
import bQ from "../assets/bQ.png";
import bR from "../assets/bR.png";
import bB from "../assets/bB.png";
import bN from "../assets/bN.png";

export const PROMOTION_IMAGES = {
  wQ, wR, wB, wN,
  bQ, bR, bB, bN,
};