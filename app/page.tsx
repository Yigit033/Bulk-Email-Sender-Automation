import { EmailSenderForm } from "@/components/email-sender-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Bulk Email Sender
          </h1>
          <p className="text-muted-foreground text-lg">
            Send personalized emails to multiple recipients with ease
          </p>
        </div>
        <EmailSenderForm />
      </div>
    </div>
  );
}
