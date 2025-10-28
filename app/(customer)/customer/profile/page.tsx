export const metadata = { title: 'Customer • Clinic Profile' };

type SectionKey =
    | 'basic' | 'services' | 'doctors' | 'additional'
    | 'hours' | 'gallery' | 'location' | 'payments' | 'reviews';

type Section = {
    key: SectionKey;
    label: string;
    chip?: 'Required' | 'Empty' | 'Complete';
    active?: boolean;             // <- вот это
};

const sections: Section[] = [
    { key: 'basic', label: 'Basic Information', chip: 'Required', active: true },
    { key: 'services', label: 'Services', chip: 'Required' },
    { key: 'doctors', label: 'Doctors', chip: 'Required' },
    { key: 'additional', label: 'Additional Services', chip: 'Empty' },
    { key: 'hours', label: 'Operating Hours', chip: 'Empty' },
    { key: 'gallery', label: 'Gallery', chip: 'Empty' },
    { key: 'location', label: 'Location', chip: 'Empty' },
    { key: 'payments', label: 'Payment Methods', chip: 'Empty' },
    { key: 'reviews', label: 'Reviews', chip: 'Complete' },
];

function chipClass(chip?: Section['chip']) {
    switch (chip) {
        case 'Required': return 'ml-2 rounded bg-rose-100 px-2 py-0.5 text-rose-600 text-xs';
        case 'Empty': return 'ml-2 rounded bg-gray-100 px-2 py-0.5 text-gray-600 text-xs';
        case 'Complete': return 'ml-2 rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 text-xs';
        default: return 'ml-2 rounded bg-gray-100 px-2 py-0.5 text-gray-600 text-xs';
    }
}

export default function ClinicProfilePage() {
    const sections = [
        { key: 'basic', label: 'Basic Information', chip: 'Required', active: true },
        { key: 'services', label: 'Services', chip: 'Required' },
        { key: 'doctors', label: 'Doctors', chip: 'Required' },
        { key: 'additional', label: 'Additional Services', chip: 'Empty' },
        { key: 'hours', label: 'Operating Hours', chip: 'Empty' },
        { key: 'gallery', label: 'Gallery', chip: 'Empty' },
        { key: 'location', label: 'Location', chip: 'Empty' },
        { key: 'payments', label: 'Payment Methods', chip: 'Empty' },
        { key: 'reviews', label: 'Reviews', chip: 'Complete' },
    ] as const;

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <div className="text-2xl font-semibold">Basic Information</div>
                <p className="text-sm text-gray-600">
                    Set up your clinic’s basic information and contact details
                </p>
            </header>

            {/* Top status strip */}
            <div className="rounded-md border bg-amber-50 p-3 text-sm text-amber-800">
                ⓘ Complete all required fields to submit your clinic for review. You’re 0% done!
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                {/* Left sections */}
                <aside className="space-y-4">
                    <div className="rounded-xl border bg-white">
                        <div className="space-y-1 p-4">
                            <div className="text-sm text-gray-600">Status</div>
                            <div className="rounded-md border px-2 py-1 text-xs">Draft</div>
                        </div>
                        <div className="border-t p-4">
                            <div className="text-sm text-gray-600">Profile Completion</div>
                            <div className="mt-2 h-2 w-full rounded bg-gray-100">
                                <div className="h-2 w-0 rounded bg-teal-500" />
                            </div>
                            <button className="mt-3 w-full rounded-md bg-teal-600 px-3 py-2 text-sm text-white">
                                Publish Clinic
                            </button>
                            <div className="mt-2 text-xs text-gray-500">
                                Complete all sections to enable publishing
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-2">
                        <div className="px-2 pb-2 text-sm font-medium">Clinic Profile Sections</div>
                        <ul className="space-y-1">
                            {sections.map((s) => (
                                <li key={s.key}>
                                    <button
                                        className={
                                            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ' +
                                            ('active' in s && s.active) ? '...' : '...'
                                        }
                                    >
                                        <span>{s.label}</span>
                                        <span className={chipClass(s.chip)}>{s.chip}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Right form */}
                <section className="space-y-6 rounded-xl border bg-white p-6">
                    <h3 className="text-lg font-semibold">Clinic Details</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm">Clinic Name *</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="Enter clinic name" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">URL Slug</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="clinic-url-slug" />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm">Specialty *</label>
                            <select className="w-full rounded-md border px-3 py-2">
                                <option>Select specialty</option>
                            </select>
                        </div>
                        <div />

                        <div>
                            <label className="mb-1 block text-sm">Country *</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="Enter country" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">City *</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="Enter city" />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm">Province/State</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="Enter province or state" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm">District/Area</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="Enter district or area" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm">Full Address *</label>
                            <input className="w-full rounded-md border px-3 py-2" placeholder="Enter complete clinic address" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm">Description</label>
                            <textarea
                                rows={6}
                                className="w-full rounded-md border px-3 py-2"
                                placeholder="Describe your clinic, services, and what makes you special"
                            />
                            <div className="mt-1 text-xs text-gray-500">
                                This description will be visible to patients browsing clinics.
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button className="rounded-md border px-4 py-2 text-sm">💾 Save Draft</button>
                        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">📤 Submit for Review</button>
                    </div>
                </section>
            </div>
        </div>
    );
}
