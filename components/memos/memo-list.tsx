// Tag: core
// Path: /Users/hodduk/Documents/git/gearlog/components/memos/memo-list.tsx

"use client";

import { useEffect, useState } from "react";
import { useVehicleStore } from "@/lib/store/vehicle-store";

type Memo = {
  id: string;
  category: string;
  content: string;
  status: "PENDING" | "SCHEDULED" | "DONE";
  createdAt: string;
};

const STATUS_CONFIG = {
  PENDING: { label: "확인필요", color: "bg-yellow-100 text-yellow-800" },
  SCHEDULED: { label: "예약됨", color: "bg-blue-100 text-blue-800" },
  DONE: { label: "완료", color: "bg-green-100 text-green-800" },
} as const;

const NEXT_STATUS: Record<Memo["status"], Memo["status"] | null> = {
  PENDING: "SCHEDULED",
  SCHEDULED: "DONE",
  DONE: null,
};

export function MemoList({ refreshKey }: { refreshKey: number }) {
  const selectedVehicleId = useVehicleStore((s) => s.selectedVehicleId);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVehicleId) {
      setMemos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/maintenance-memos?vehicleId=${selectedVehicleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMemos(data);
      })
      .finally(() => setLoading(false));
  }, [selectedVehicleId, refreshKey]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/maintenance-memos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) {
      const updated = await res.json();
      setMemos((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: updated.status } : m))
      );
    }
  }

  if (!selectedVehicleId) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        차량을 먼저 선택해주세요
      </p>
    );
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        로딩 중...
      </p>
    );
  }

  if (memos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        정비 메모가 없습니다
      </p>
    );
  }

  const pending = memos.filter((m) => m.status !== "DONE");
  const done = memos.filter((m) => m.status === "DONE");

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            미완료 ({pending.length})
          </h3>
          {pending.map((memo) => {
            const config = STATUS_CONFIG[memo.status];
            const nextStatus = NEXT_STATUS[memo.status];
            return (
              <div
                key={memo.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {memo.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground">
                      {memo.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(memo.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus(memo.id, nextStatus)}
                      className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      {STATUS_CONFIG[nextStatus].label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            완료 ({done.length})
          </h3>
          {done.map((memo) => (
            <div
              key={memo.id}
              className="rounded-xl border border-border bg-card p-4 opacity-60"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG.DONE.color}`}
                >
                  완료
                </span>
                <span className="text-xs text-muted-foreground">
                  {memo.category}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground line-through">
                {memo.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
