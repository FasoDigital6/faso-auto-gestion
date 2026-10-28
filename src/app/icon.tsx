import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon : initiale de Sacko-Green sur le vert du logo. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#015e07",
          color: "#fff",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: "50%",
        }}
      >
        S
      </div>
    ),
    size
  );
}
