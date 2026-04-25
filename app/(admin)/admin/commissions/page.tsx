// app/(admin)/admin/commissions/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/browserClient";

// ── Types ──
type Clinic = { id: string; name: string; slug: string; status: string };
type Service = { service_id: number; service_name: string; price: number | null; currency: string };

type Rule = {
  id: string;
  clinic_id: string;
  service_id: number | null;
  rule_type: "percentage" | "fixed";
  threshold_min: number | null;
  threshold_max: number | null;
  rate_pct: number | null;
  fixed_amount: number | null;
  currency: string;
  priority: number;
  is_active: boolean;
  label: string | null;
};

type RuleDraft = Omit<Rule, "id"> & { id?: string };

const EMPTY_RULE: RuleDraft = {
  clinic_id: "",
  service_id: null,
  rule_type: "percentage",
  threshold_min: null,
  threshold_max: null,
  rate_pct: 10,
  fixed_amount: null,
  currency: "EUR",
  priority: 0,
  is_active: true,
  label: null,
};

const CURRENCIES = ["EUR", "USD", "GBP", "TRY"];

// ── Helpers ──
function formatThreshold(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Any amount";
  if (min == null) return `< ${max}`;
  if (max == null) return `≥ ${min}`;
  return `${min} – ${max}`;
}

function formatCommission(rule: Rule | RuleDraft): string {
  if (rule.rule_type === "percentage") return `${rule.rate_pct}%`;
  return `${rule.fixed_amount} ${rule.currency}`;
}

function simulateCommission(
  rules: (Rule | RuleDraft)[],
  cost: number,
  serviceId: number | null
): { amount: number; rule: Rule | RuleDraft | null; isDefault: boolean } {
  const activeRules = rules.filter((r) => r.is_active);

  if (serviceId) {
    for (const rule of activeRules.filter((r) => r.service_id === serviceId)) {
      const minOk = rule.threshold_min == null || cost >= rule.threshold_min;
      const maxOk = rule.threshold_max == null || cost < rule.threshold_max;
      if (minOk && maxOk) {
        const amount = rule.rule_type === "percentage"
          ? Math.round(cost * (rule.rate_pct ?? 0)) / 100
          : rule.fixed_amount ?? 0;
        return { amount, rule, isDefault: false };
      }
    }
  }

  for (const rule of activeRules.filter((r) => r.service_id == null)) {
    const minOk = rule.threshold_min == null || cost >= rule.threshold_min;
    const maxOk = rule.threshold_max == null || cost < rule.threshold_max;
    if (minOk && maxOk) {
      const amount = rule.rule_type === "percentage"
        ? Math.round(cost * (rule.rate_pct ?? 0)) / 100
        : rule.fixed_amount ?? 0;
      return { amount, rule, isDefault: false };
    }
  }

  return { amount: Math.round(cost * 10) / 100, rule: null, isDefault: true };
}

// ── Main Page ──
export default function CommissionsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [clinicServices, setClinicServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<RuleDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simCost, setSimCost] = useState<number>(1500);
  const [simServiceId, setSimServiceId] = useState<number | null>(null);

  const [tab, setTab] = useState<"all" | "services">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clinicsRes, rulesRes] = await Promise.all([
        supabase.from("clinics").select("id, name, slug, status").not("owner_id", "is", null).order("name"),
        supabase.from("clinic_commission_rules").select("*").order("clinic_id").order("priority", { ascending: true }),
      ]);
      if (clinicsRes.error) throw clinicsRes.error;
      if (rulesRes.error) throw rulesRes.error;
      setClinics((clinicsRes.data ?? []) as Clinic[]);
      setRules((rulesRes.data ?? []) as Rule[]);
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadClinicServices = useCallback(async (clinicId: string) => {
    const { data } = await supabase
      .from("clinic_services")
      .select("service_id, price, currency, services(name)")
      .eq("clinic_id", clinicId);

    setClinicServices(
      (data ?? []).map((row: any) => ({
        service_id: row.service_id,
        service_name: row.services?.name ?? `Service #${row.service_id}`,
        price: row.price ? Number(row.price) : null,
        currency: row.currency ?? "USD",
      }))
    );
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (selectedClinicId) {
      loadClinicServices(selectedClinicId);
    } else {
      setClinicServices([]);
    }
  }, [selectedClinicId, loadClinicServices]);

  const clinicWideRules = selectedClinicId
    ? rules.filter((r) => r.clinic_id === selectedClinicId && r.service_id == null).sort((a, b) => a.priority - b.priority)
    : [];

  const serviceRules = selectedClinicId
    ? rules.filter((r) => r.clinic_id === selectedClinicId && r.service_id != null).sort((a, b) => a.priority - b.priority)
    : [];

  const allClinicRules = [...clinicWideRules, ...serviceRules];
  const selectedClinic = clinics.find((c) => c.id === selectedClinicId);
  const clinicsWithRules = new Set(rules.map((r) => r.clinic_id));

  const simResult = selectedClinicId ? simulateCommission(allClinicRules, simCost, simServiceId) : null;

  // CRUD
  const saveRule = async (draft: RuleDraft) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = {
        clinic_id: draft.clinic_id,
        service_id: draft.service_id || null,
        rule_type: draft.rule_type,
        threshold_min: draft.threshold_min,
        threshold_max: draft.threshold_max,
        rate_pct: draft.rule_type === "percentage" ? draft.rate_pct : null,
        fixed_amount: draft.rule_type === "fixed" ? draft.fixed_amount : null,
        currency: draft.currency,
        priority: draft.priority,
        is_active: draft.is_active,
        label: draft.label || null,
      };

      if (!draft.id) {
        const { error } = await supabase.from("clinic_commission_rules").insert(payload);
        if (error) throw error;
        setSuccessMsg("Rule created");
      } else {
        const { error } = await supabase.from("clinic_commission_rules").update(payload).eq("id", draft.id);
        if (error) throw error;
        setSuccessMsg("Rule updated");
      }
      setEditingRule(null);
      await loadData();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Delete this commission rule?")) return;
    setError(null);
    try {
      const { error } = await supabase.from("clinic_commission_rules").delete().eq("id", ruleId);
      if (error) throw error;
      setSuccessMsg("Rule deleted");
      await loadData();
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  };

  const toggleRule = async (rule: Rule) => {
    await saveRule({ ...rule, is_active: !rule.is_active });
  };

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  if (loading) {
    return (
      <div className="space-y-6 pt-6">
        <h1 className="text-xl sm:text-2xl font-bold">Commission Rules</h1>
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Commission Rules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set per-clinic or per-service commission rates. Clinics without custom rules use default 10%.
        </p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMsg && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMsg}</div>}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Clinics ({clinics.length})</h2>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {clinics.map((c) => {
              const hasRules = clinicsWithRules.has(c.id);
              const isSelected = selectedClinicId === c.id;
              const rulesCount = rules.filter((r) => r.clinic_id === c.id).length;

              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClinicId(c.id); setEditingRule(null); setTab("all"); }}
                  className={`w-full text-left px-4 py-3 border-b last:border-0 transition ${
                    isSelected ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.status}</div>
                    </div>
                    {hasRules ? (
                      <span className="shrink-0 ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {rulesCount} rule{rulesCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="shrink-0 ml-2 text-xs text-gray-400">Default 10%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {!selectedClinicId ? (
            <div className="rounded-xl border bg-white px-6 py-16 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-gray-500">Select a clinic to view or edit commission rules</div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedClinic?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {allClinicRules.length === 0
                        ? "Using default commission (10%)"
                        : `${clinicWideRules.length} clinic-wide, ${serviceRules.length} service-specific`}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingRule({
                        ...EMPTY_RULE,
                        clinic_id: selectedClinicId!,
                        service_id: tab === "services" ? (clinicServices[0]?.service_id ?? null) : null,
                        priority: allClinicRules.length,
                      })
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    + Add Rule
                  </button>
                </div>

                <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setTab("all")}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      tab === "all" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Clinic-wide ({clinicWideRules.length})
                  </button>
                  <button
                    onClick={() => setTab("services")}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      tab === "services" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Per Service ({serviceRules.length})
                  </button>
                </div>
              </div>

              {tab === "all" && clinicWideRules.length > 0 && (
                <RulesList rules={clinicWideRules} services={clinicServices} onEdit={setEditingRule} onDelete={deleteRule} onToggle={toggleRule} />
              )}
              {tab === "all" && clinicWideRules.length === 0 && (
                <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                  No clinic-wide rules. Default 10% applies to all services without a specific rule.
                </div>
              )}

              {tab === "services" && (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-white">
                    <div className="border-b px-4 py-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Clinic Services ({clinicServices.length})
                      </h3>
                    </div>
                    {clinicServices.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No services configured for this clinic.</div>
                    ) : (
                      <div className="divide-y">
                        {clinicServices.map((svc) => {
                          const svcRules = serviceRules.filter((r) => r.service_id === svc.service_id);
                          const hasRule = svcRules.length > 0;
                          return (
                            <div key={svc.service_id} className="px-4 py-3 flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{svc.service_name}</div>
                                <div className="text-xs text-gray-500">
                                  {svc.price != null ? `${svc.price} ${svc.currency}` : "No price set"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasRule ? (
                                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {svcRules.map((r) => formatCommission(r)).join(", ")}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Inherits clinic rule</span>
                                )}
                                <button
                                  onClick={() =>
                                    setEditingRule({
                                      ...EMPTY_RULE,
                                      clinic_id: selectedClinicId!,
                                      service_id: svc.service_id,
                                      priority: allClinicRules.length,
                                      label: svc.service_name,
                                    })
                                  }
                                  className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
                                >
                                  {hasRule ? "Add another" : "Set rule"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {serviceRules.length > 0 && (
                    <RulesList rules={serviceRules} services={clinicServices} onEdit={setEditingRule} onDelete={deleteRule} onToggle={toggleRule} />
                  )}
                </div>
              )}

              <div className="rounded-xl border bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Commission Simulator</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Procedure cost</label>
                    <input type="number" value={simCost} onChange={(e) => setSimCost(Number(e.target.value))}
                      className="w-32 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Service (optional)</label>
                    <select value={simServiceId ?? ""} onChange={(e) => setSimServiceId(e.target.value ? Number(e.target.value) : null)}
                      className="w-48 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Any / clinic-wide</option>
                      {clinicServices.map((s) => (
                        <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-4 py-2">
                    <div className="text-xs text-gray-500">Commission</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {simResult ? `${simResult.amount.toFixed(2)} ${simResult.rule?.currency ?? "EUR"}` : "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {simResult?.isDefault ? "Default 10%" : simResult?.rule ? `Rule: ${formatCommission(simResult.rule)}` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {editingRule && (
                <RuleForm draft={editingRule} services={clinicServices} onSave={saveRule} onCancel={() => setEditingRule(null)} saving={saving} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Rules List ──
function RulesList({
  rules,
  services,
  onEdit,
  onDelete,
  onToggle,
}: {
  rules: Rule[];
  services: Service[];
  onEdit: (r: RuleDraft) => void;
  onDelete: (id: string) => void;
  onToggle: (r: Rule) => void;
}) {
  return (
    <div className="rounded-xl border bg-white divide-y">
      {rules.map((rule, idx) => {
        const svcName = rule.service_id
          ? services.find((s) => s.service_id === rule.service_id)?.service_name ?? `Service #${rule.service_id}`
          : null;
        return (
          <div key={rule.id} className={`p-4 ${!rule.is_active ? "opacity-50" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {rule.rule_type === "percentage" ? `${rule.rate_pct}% of procedure cost` : `Fixed ${rule.fixed_amount} ${rule.currency}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>When cost {formatThreshold(rule.threshold_min, rule.threshold_max)} {rule.currency}</span>
                    {svcName && (
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {svcName}
                      </span>
                    )}
                    {rule.label && !svcName && (
                      <span className="text-gray-400">({rule.label})</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(rule)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                    rule.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {rule.is_active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => onEdit({ ...rule })}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition">
                  Edit
                </button>
                <button onClick={() => onDelete(rule.id)}
                  className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Rule Form ──
function RuleForm({
  draft,
  services,
  onSave,
  onCancel,
  saving,
}: {
  draft: RuleDraft;
  services: Service[];
  onSave: (d: RuleDraft) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<RuleDraft>(draft);
  const isNew = !form.id;
  const update = (partial: Partial<RuleDraft>) => setForm((prev) => ({ ...prev, ...partial }));

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{isNew ? "Add New Rule" : "Edit Rule"}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Applies to</label>
          <select value={form.service_id ?? ""} onChange={(e) => update({ service_id: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All services (clinic-wide)</option>
            {services.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.service_name} {s.price != null ? `(${s.price} ${s.currency})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Rule Type</label>
          <select value={form.rule_type}
            onChange={(e) => update({
              rule_type: e.target.value as "percentage" | "fixed",
              rate_pct: e.target.value === "percentage" ? 10 : null,
              fixed_amount: e.target.value === "fixed" ? 250 : null,
            })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {form.rule_type === "percentage" ? "Rate (%)" : "Fixed Amount"}
          </label>
          <input type="number" step={form.rule_type === "percentage" ? "0.5" : "1"}
            value={form.rule_type === "percentage" ? form.rate_pct ?? "" : form.fixed_amount ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              update(form.rule_type === "percentage" ? { rate_pct: val } : { fixed_amount: val });
            }}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Min Cost (≥)</label>
          <input type="number" placeholder="No minimum" value={form.threshold_min ?? ""}
            onChange={(e) => update({ threshold_min: e.target.value === "" ? null : Number(e.target.value) })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Cost (&lt;)</label>
          <input type="number" placeholder="No maximum" value={form.threshold_max ?? ""}
            onChange={(e) => update({ threshold_max: e.target.value === "" ? null : Number(e.target.value) })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
          <select value={form.currency} onChange={(e) => update({ currency: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority (lower = first)</label>
          <input type="number" value={form.priority} onChange={(e) => update({ priority: Number(e.target.value) })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Label (optional, visible to clinic)</label>
          <input type="text" placeholder="e.g. Special rate for Hair Transplant" value={form.label ?? ""}
            onChange={(e) => update({ label: e.target.value || null })}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => onSave(form)} disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition">
          {saving ? "Saving..." : isNew ? "Create Rule" : "Save Changes"}
        </button>
        <button onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </div>
  );
}