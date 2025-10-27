"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle2, XCircle, Upload } from "lucide-react";
import { API_BASE_URL } from "@/app/api/config";

interface EmailResult {
  email: string;
  success: boolean;
  message: string;
}

interface EmailResponse {
  total: number;
  successful: number;
  failed: number;
  results: EmailResult[];
}

export function EmailSenderForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmailResponse | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<string>("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload-excel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload Excel file");
      }

      const data = await response.json();
      const emailList = data.emails.join('\n');
      setRecipients(emailList);
      setError(""); // Clear any previous errors
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResults(null);
    setDuplicateInfo("");

    // Get unique emails (case-insensitive)
    const recipientList = recipients
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
    
    // Remove duplicates (case-insensitive comparison)
    const uniqueRecipients = Array.from(
      new Set(recipientList.map(email => email.toLowerCase()))
    );

    if (uniqueRecipients.length === 0) {
      setError("Please enter at least one recipient email address");
      return;
    }

    const invalidEmails = uniqueRecipients.filter((email) => !validateEmail(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email addresses: ${invalidEmails.join(", ")}`);
      return;
    }

    // Show info if duplicates were removed
    if (recipientList.length > uniqueRecipients.length) {
      const removedCount = recipientList.length - uniqueRecipients.length;
      setDuplicateInfo(`${removedCount} duplicate email address removed`);
    } else {
      setDuplicateInfo("");
    }

    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }

    if (!body.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/send-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          body,
          recipients: uniqueRecipients,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send emails");
      }

      const data: EmailResponse = await response.json();
      setResults(data);

      if (data.successful === data.total) {
        setSubject("");
        setBody("");
        setRecipients("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Bulk Emails
          </CardTitle>
          <CardDescription>
            Send the same email to multiple recipients individually. Each email is sent separately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Enter your message (HTML supported)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={loading}
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Textarea
                    id="recipients"
                    placeholder="Enter email addresses (one per line) or upload Excel file"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    disabled={loading || uploading}
                    rows={6}
                    className="resize-none font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={loading || uploading}
                    className="hidden"
                    id="excel-upload"
                  />
                  <Label
                    htmlFor="excel-upload"
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload Excel File</span>
                      </>
                    )}
                  </Label>
                  {recipients && (
                    <span className="text-sm text-muted-foreground">
                      ({recipients.split('\n').filter(e => e.trim()).length} recipients)
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter email addresses (one per line) or upload an Excel file with emails in the first column
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {duplicateInfo && (
              <Alert>
                <AlertDescription className="text-blue-700">{duplicateInfo} ✨</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Emails
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.successful} of {results.total} emails sent successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm break-all">{result.email}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
