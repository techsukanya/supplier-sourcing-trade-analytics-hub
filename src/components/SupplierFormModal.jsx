import React, { useMemo, useState } from "react";
import { X, Factory, CheckCircle2 } from "lucide-react";
import { corridors, getCommodityOptions, riskTiers } from "../data/filterOptions";
import { useFilters } from "../context/FiltersContext";

const sourcingCorridors = corridors.filter((c) => c.id !== "global");
const sourcingRiskTiers = riskTiers.filter((r) => r.id !== "all");

const emptyForm = {
  name: "",
  flag: "",
  location: "",
  sector: "",
  corridor: sourcingCorridors[0].id,
  commodity: getCommodityOptions(sourcingCorridors[0].id)[1] || "All Primary Commodities",
  shipsPerYear: "",
  teu: "",
  score: "",
  onTime: "",
  certs: "",
  riskTier: "good",
  role: "",
  roleSub: "",
};

function initialsFor(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function scoreTagFor(score) {
  if (score >= 95) return "Top Decile";
  if (score >= 90) return "Tier-1 Benchmark";
  if (score >= 85) return "Strong Core";
  if (score >= 80) return "Audited Partner";
  if (score >= 70) return "Watchlist";
  return "High-Risk Bottleneck";
}

// This form intentionally mirrors every column shown in ExportersTable /
// used by StatsRow, PerformanceMatrixChart and SpendDonutChart — so a
// sourced supplier immediately appears, filterable and exportable, exactly
// like the seed data. Swap the local addSupplier() call for a POST to your
// backend (see services/tradeDataService.js) to persist it server-side.
export default function SupplierFormModal() {
  const { isSupplierFormOpen, closeSupplierForm, addSupplier } = useFilters();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const commodityOptions = useMemo(() => getCommodityOptions(form.corridor), [form.corridor]);

  if (!isSupplierFormOpen) return null;

  function update(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "corridor") {
        const opts = getCommodityOptions(value);
        if (!opts.includes(prev.commodity)) next.commodity = opts[1] || opts[0];
      }
      return next;
    });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[A-Za-z]{2}$/.test(form.flag.trim())) e.flag = "2-letter country code";
    if (!form.location.trim()) e.location = "Required";
    if (!form.sector.trim()) e.sector = "Required";
    if (!form.shipsPerYear || Number(form.shipsPerYear) <= 0) e.shipsPerYear = "Required";
    if (!form.teu || Number(form.teu) <= 0) e.teu = "Required";
    const score = Number(form.score);
    if (!form.score || score < 0 || score > 100) e.score = "0–100";
    const onTime = Number(form.onTime);
    if (!form.onTime || onTime < 0 || onTime > 100) e.onTime = "0–100";
    if (!form.role.trim()) e.role = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;

    const score = Number(form.score);
    const onTime = Number(form.onTime);
    const riskMeta = sourcingRiskTiers.find((r) => r.id === form.riskTier) || sourcingRiskTiers[0];

    addSupplier({
      initials: initialsFor(form.name),
      name: form.name.trim(),
      flag: form.flag.trim().toUpperCase(),
      location: form.location.trim(),
      duns: `D-U-N-S: Pending Verification · ${form.sector.trim()}`,
      corridor: form.corridor,
      commodity: form.commodity,
      score,
      scoreTag: scoreTagFor(score),
      freq: `${form.shipsPerYear} ships/yr · ${form.teu} TEU`,
      freqSub: "Newly Onboarded",
      teu: Number(form.teu),
      onTime: `${onTime.toFixed(1)}%`,
      onTimeSub: "Baseline Pending",
      onTimeGood: onTime >= 90,
      certs: form.certs
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      certsSub: "",
      risk: riskMeta.label,
      riskTone: riskMeta.id,
      role: form.role.trim(),
      roleSub: form.roleSub.trim() || "Pending Category Allocation",
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(emptyForm);
      closeSupplierForm();
    }, 1100);
  }

  function handleClose() {
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
    closeSupplierForm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-primary/40 p-4 pt-10 sm:pt-16">
      <div className="w-full max-w-2xl rounded-lg border border-hairline bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
            <Factory size={16} className="text-series-1" />
            Source New Supplier
          </h2>
          <button onClick={handleClose} className="rounded p-1 text-ink-muted hover:bg-plane" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
            <CheckCircle2 size={32} className="text-status-good" />
            <p className="text-sm font-semibold text-ink-primary">Supplier added to dossier</p>
            <p className="text-xs text-ink-secondary">
              {form.name} now appears in Top Exporters &amp; Company-Level Intelligence.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
            <Field label="Company Name" error={errors.name} full>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Riverside Metals Pte Ltd"
                className={inputClass(errors.name)}
              />
            </Field>

            <Field label="Country Code" error={errors.flag} hint="2 letters, e.g. SG">
              <input
                value={form.flag}
                onChange={(e) => update("flag", e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="SG"
                className={inputClass(errors.flag)}
              />
            </Field>

            <Field label="City / Port" error={errors.location}>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Singapore"
                className={inputClass(errors.location)}
              />
            </Field>

            <Field label="Sector / Product" error={errors.sector} full>
              <input
                value={form.sector}
                onChange={(e) => update("sector", e.target.value)}
                placeholder="e.g. Precision Bearings"
                className={inputClass(errors.sector)}
              />
            </Field>

            <Field label="Origin Corridor">
              <select value={form.corridor} onChange={(e) => update("corridor", e.target.value)} className={inputClass()}>
                {sourcingCorridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Commodity / Sector">
              <select value={form.commodity} onChange={(e) => update("commodity", e.target.value)} className={inputClass()}>
                {commodityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Shipments / Year" error={errors.shipsPerYear}>
              <input
                type="number"
                min="1"
                value={form.shipsPerYear}
                onChange={(e) => update("shipsPerYear", e.target.value)}
                placeholder="24"
                className={inputClass(errors.shipsPerYear)}
              />
            </Field>

            <Field label="TEU Volume" error={errors.teu}>
              <input
                type="number"
                min="1"
                value={form.teu}
                onChange={(e) => update("teu", e.target.value)}
                placeholder="80"
                className={inputClass(errors.teu)}
              />
            </Field>

            <Field label="Reliability Score (0–100)" error={errors.score}>
              <input
                type="number"
                min="0"
                max="100"
                value={form.score}
                onChange={(e) => update("score", e.target.value)}
                placeholder="88"
                className={inputClass(errors.score)}
              />
            </Field>

            <Field label="On-Time Dispatch % (0–100)" error={errors.onTime}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.onTime}
                onChange={(e) => update("onTime", e.target.value)}
                placeholder="92.5"
                className={inputClass(errors.onTime)}
              />
            </Field>

            <Field label="Sourcing Risk Tier">
              <select value={form.riskTier} onChange={(e) => update("riskTier", e.target.value)} className={inputClass()}>
                {sourcingRiskTiers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Certifications" hint="comma-separated" full>
              <input
                value={form.certs}
                onChange={(e) => update("certs", e.target.value)}
                placeholder="ISO 9001, REACH"
                className={inputClass()}
              />
            </Field>

            <Field label="Diversification Role" error={errors.role}>
              <input
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="e.g. Secondary Hedge"
                className={inputClass(errors.role)}
              />
            </Field>

            <Field label="Role Detail">
              <input
                value={form.roleSub}
                onChange={(e) => update("roleSub", e.target.value)}
                placeholder="e.g. 12% Category Volume"
                className={inputClass()}
              />
            </Field>

            <div className="col-span-full mt-2 flex items-center justify-end gap-2 border-t border-hairline pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-hairline px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-plane"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-series-1 px-3 py-2 text-xs font-medium text-white hover:bg-series-1/90"
              >
                Add Supplier to Dossier
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function inputClass(error) {
  return `w-full rounded-md border bg-surface px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-series-1 ${
    error ? "border-status-critical" : "border-hairline"
  }`;
}

function Field({ label, error, hint, full, children }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 flex items-center justify-between text-[11px] font-medium text-ink-secondary">
        {label}
        {hint && <span className="text-[10px] font-normal text-ink-muted">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-0.5 block text-[10px] font-medium text-status-critical">{error}</span>}
    </label>
  );
}
