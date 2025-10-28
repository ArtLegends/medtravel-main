// простой тонкий “пустой” график, как на мокапе
export default function MiniLineChart({
  title,
  legend,
}: {
  title: string;
  legend?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm text-gray-700">{title}</div>
      <div className="h-64 w-full rounded-md border bg-white">
        {/* сетка */}
        <div className="h-full w-full bg-[linear-gradient(#eee_1px,transparent_1px),linear-gradient(90deg,#eee_1px,transparent_1px)] bg-[length:40px_40px] rounded-md" />
      </div>
      {legend ? <div className="mt-2 text-xs text-gray-500">{legend}</div> : null}
    </div>
  );
}
