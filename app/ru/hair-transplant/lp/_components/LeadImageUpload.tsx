"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";

type Props = {
  maxFiles?: number;
  helperText?: string;
};

export default function LeadImageUpload({
  maxFiles = 3,
  helperText = "Фото (спереди / сверху / сбоку). До 3 файлов, JPG/PNG.",
}: Props) {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(
    () =>
      files.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
      })),
    [files]
  );

  // чистим objectURL, чтобы не копить память
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  function onPick(next: FileList | null) {
    if (!next) return;
    const arr = Array.from(next);
    const merged = [...files, ...arr].slice(0, maxFiles);
    setFiles(merged);
  }

  function removeAt(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="rounded-2xl border bg-slate-50/60 p-3 ring-1 ring-black/5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
          <ImagePlus className="h-5 w-5 text-teal-700" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Фото для расчёта
              </div>
              <div className="mt-0.5 text-xs leading-relaxed text-slate-600">
                {helperText}
              </div>
            </div>

            <div className="shrink-0 text-xs text-slate-500">
              {files.length}/{maxFiles}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label
              htmlFor={id}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Выбрать фото
            </label>

            <input
              id={id}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPick(e.target.files)}
            />

            {files.length > 0 && (
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Очистить
              </button>
            )}
          </div>

          {/* миниатюры: фикс размер, не раздувают форму */}
          {previews.length > 0 && (
            <div className="mt-3">
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {previews.map((p, i) => (
                  <div
                    key={p.url}
                    className="relative shrink-0 overflow-hidden rounded-xl border bg-white"
                    style={{ width: 56, height: 56 }}
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />

                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 hover:bg-white"
                      aria-label="Удалить"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-[11px] text-slate-500">
                Миниатюры не отправляют данные сами по себе — это только UI (можно подключить загрузку позже).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}