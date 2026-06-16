import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const imageData = readFileSync(join(process.cwd(), "public/messi.jpg"));
  const base64 = `data:image/jpeg;base64,${imageData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <img src={base64} width={64} height={64} style={{ objectFit: "cover" }} alt="" />
      </div>
    ),
    { ...size },
  );
}
