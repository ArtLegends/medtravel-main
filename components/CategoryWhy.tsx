export default function CategoryWhy() {
  const items = [
    "We are medical tourism professionals",
    "We will help you find the clinic and doctor that best suits your needs",
    "We will provide quick and easy access to all the information you need",
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-6 text-center text-3xl font-bold">Why Choose Us?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5">
              <div className="mb-2 h-8 w-8 rounded-full bg-blue-600 text-center text-white">
                <span className="inline-block pt-1">{i + 1}</span>
              </div>
              <p className="text-gray-800">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
