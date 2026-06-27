import type { Tone } from "./types/index.ts";
import { useCoverLetter } from "./hooks/useCoverLetter.ts";
import { ToneSelector } from "./components/ToneSelector.tsx";
import { PdfUpload } from "./components/PdfUpload.tsx";
import { LetterResult } from "./components/LetterResult.tsx";

export default function App() {
  const { form, status, result, error, setField, generate, regenerate } =
    useCoverLetter();
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-oklch(55.4% 0.046 257.417)">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Cover letter generator
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Paste the job description and your CV. I'll write a tailored letter
            — and give you the honest take a senior recruiter would.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            10-year recruiter lens · no filter
          </span>
        </header>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="company"
                className="mb-1.5 block text-xs font-medium tracking-widest text-gray-500 uppercase"
              >
                Company
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={(e) => setField("company", e.target.value)}
                placeholder="e.g. Monzo"
                disabled={isLoading}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-40"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-xs font-medium tracking-widest text-gray-500 uppercase"
              >
                Role
              </label>
              <input
                id="role"
                type="text"
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                disabled={isLoading}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="jd"
              className="mb-1.5 block text-xs font-medium tracking-widest text-gray-500 uppercase"
            >
              Job description
            </label>
            <textarea
              id="jd"
              value={form.jobDescription}
              onChange={(e) => setField("jobDescription", e.target.value)}
              placeholder="Paste the full job description here…"
              disabled={isLoading}
              rows={6}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-40"
            />
          </div>

          <div>
            <label
              htmlFor="cv"
              className="mb-1.5 block text-xs font-medium tracking-widest text-gray-500 uppercase"
            >
              Your CV / Resume
            </label>
            <textarea
              id="cv"
              value={form.cvText}
              onChange={(e) => setField("cvText", e.target.value)}
              placeholder={
                form.cvFile
                  ? "PDF loaded — text field not needed"
                  : "Paste your CV or resume text here…"
              }
              disabled={isLoading || !!form.cvFile}
              rows={6}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-40"
            />
            <div className="my-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-100" aria-hidden="true" />
              <span className="text-xs text-gray-400">or upload PDF</span>
              <span className="h-px flex-1 bg-gray-100" aria-hidden="true" />
            </div>
            <PdfUpload
              file={form.cvFile}
              onFileChange={(file) => {
                setField("cvFile", file);
                if (file) setField("cvText", "");
              }}
              disabled={isLoading}
            />
          </div>

          <ToneSelector
            value={form.tone}
            onChange={(t: Tone) => setField("tone", t)}
            disabled={isLoading}
          />

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={generate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <span className="inline-flex gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                </span>
                Generating...
              </>
            ) : (
              "Generate cover letter"
            )}
          </button>
        </div>

        {result && (
          <LetterResult
            result={result}
            company={form.company}
            role={form.role}
            tone={form.tone}
            tweakPrompt={form.tweakPrompt}
            onTweakChange={(v) => setField("tweakPrompt", v)}
            onRegenerate={regenerate}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}
