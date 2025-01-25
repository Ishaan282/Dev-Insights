import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <SignIn 
        appearance={{
          elements: {
            footer: {
              "& > div:last-child": { display: "none" } // Hides only the Clerk branding
            }
          }
        }} 
      />
    </div>
  );
}
