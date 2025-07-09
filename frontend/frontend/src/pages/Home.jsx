import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.body.style.backgroundColor = "#2C2829";
    document.body.style.color = "#ffffff";
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'Nunito', sans-serif";

    return () => {
      document.body.style = null;
    };
  }, []);

  return (
    <div style={{ padding: "2rem", height: "calc(100vh - 70px)" }}>

    </div>
  );
}
