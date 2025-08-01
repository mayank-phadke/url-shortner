"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, customAlias }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      setShortUrl("");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-4">
      <section className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-10">
        <h1 className="text-4xl font-bold text-center mb-2">
          Welcome to ShortLink
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-4">
          Simplify your links with our easy-to-use URL shortener.
          <br />
          Fast, reliable, and secure.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full bg-card p-6 rounded-lg shadow-lg"
        >
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your long URL"
            required
          />
          <Input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="Custom alias (optional)"
          />
          <Button type="submit" className="w-full">
            Shorten
          </Button>
        </form>
        {error && (
          <div className="w-full text-center text-red-500 font-medium bg-card rounded-md py-2 px-4 mt-2 shadow">
            {error}
          </div>
        )}
        {shortUrl && (
          <div className="w-full flex flex-col items-center gap-2 bg-card rounded-md py-4 px-4 mt-2 shadow">
            <p className="font-semibold text-green-700">
              Your short URL:
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary underline break-all"
              >
                {shortUrl}
              </a>
            </p>
            <p>1000 random clicks have been generated for demo</p>
            <Button
              type="button"
              className="w-full md:w-auto"
              onClick={() => navigator.clipboard.writeText(shortUrl)}
            >
              Copy
            </Button>
            <a
              href={`/analytics/${shortUrl.split("/").pop()}`}
              className="text-blue-600 underline hover:text-blue-800 font-medium mt-2"
            >
              View Analytics
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
