import ChatPage from "@/components/ChatPage";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      }
    >
      <ChatPage />
    </Suspense>
  );
};

export default page;
