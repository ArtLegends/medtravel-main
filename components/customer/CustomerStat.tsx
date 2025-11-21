// components/customer/CustomerStat.tsx

type Props = {
  title: string;
  value: number | string;
  loading?: boolean;
};

export default function CustomerStat({ title, value, loading }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>

      <div className="mt-2 text-2xl font-semibold">
        {loading ? (
          // небольшой skeleton вместо значения, пока грузится
          <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
