import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <SignUp 
        afterSignUpUrl="/sync-user" 
        appearance={{
          elements: {
            footer: {
              "& > div:last-child": { display: "none" } // Targets only the "Secured by Clerk" branding
            }
          }
        }} 
      />
    </div>
  );
}
