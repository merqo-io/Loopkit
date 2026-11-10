import { ImageResponse } from "next/og";
import { loopkitIcon } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(loopkitIcon(32), { ...size });
}
