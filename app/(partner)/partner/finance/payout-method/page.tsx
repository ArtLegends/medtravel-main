// app/(partner)/partner/finance/payout-method/page.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Country = {
  code: string;
  name: string;
  currency: string;
};

type PayoutMethod = {
  id: string;
  countryCode: string;
  name: string;
  minPayout: number;
  fee: number;
  currency: string;
};

const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States of America",
    currency: "USD",
  },
];

// 👉 пока методов нет, но тип готов под будущие данные из Supabase
const METHODS: PayoutMethod[] = [];

function formatCurrency(amount: number, currency: string) {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${currency === "EUR" ? "€" : "$"}${formatted}`;
}

export default function PayoutMethodPage() {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    COUNTRIES[0]?.code
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const selectedCountry =
    COUNTRIES.find((c) => c.code === selectedCountryCode) ?? COUNTRIES[0];

  const visibleMethods = METHODS.filter(
    (m) => m.countryCode === selectedCountry.code
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Payout methods</h1>
        <p className="text-gray-600">
          Choose how you&apos;d like to receive payouts and see available
          methods for your country of residence.
        </p>
      </div>

      {/* Карточка со страной и таблицей методов */}
      <div className="space-y-4 rounded-xl border bg-white p-4 md:p-5">
        {/* Country of residence */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Country of residence
              </div>
              <p className="text-xs text-gray-500">
                View the available methods
              </p>
            </div>

            {/* кастомный селект с аккордионом и стрелкой */}
            <div className="relative inline-flex min-w-[220px] justify-end text-sm">
              <button
                type="button"
                onClick={() => setIsCountryOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  {/* простой placeholder-флаг; потом можно заменить реальными флагами */}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs">
                    {selectedCountry.code}
                  </span>
                  <span className="truncate">{selectedCountry.name}</span>
                </span>
                <ChevronDown
                  className={
                    "h-4 w-4 text-gray-500 transition-transform " +
                    (isCountryOpen ? "rotate-180" : "")
                  }
                />
              </button>

              {isCountryOpen && (
                <div className="absolute right-0 top-10 z-10 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountryCode(country.code);
                        setIsCountryOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs">
                          {country.code}
                        </span>
                        <span className="truncate">{country.name}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {country.currency}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Таблица методов */}
        <div className="overflow-x-auto pt-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Minimum payout</th>
                <th className="px-3 py-2">Fee</th>
                <th className="px-3 py-2">Currency</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMethods.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-sm text-gray-500"
                  >
                    No payout methods available for this country yet. Once
                    methods are added, you&apos;ll be able to connect them here.
                  </td>
                </tr>
              ) : (
                visibleMethods.map((method) => (
                  <tr key={method.id} className="border-b last:border-0">
                    <td className="px-3 py-2">{method.name}</td>
                    <td className="px-3 py-2">
                      {formatCurrency(method.minPayout, method.currency)}
                    </td>
                    <td className="px-3 py-2">
                      {formatCurrency(method.fee, method.currency)}
                    </td>
                    <td className="px-3 py-2">{method.currency}</td>
                    <td className="px-3 py-2 text-right text-xs font-medium text-blue-600">
                      Add
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
