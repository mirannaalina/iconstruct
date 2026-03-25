'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { categoriesApi, repairRequestsApi } from '@/lib/api';
import type { Category, ServiceType, UrgencyLevel } from '@/types';
import { ArrowLeft, Wrench, Home, Building2 } from 'lucide-react';

const serviceTypeLabels: Record<ServiceType, string> = {
  REPAIR: 'Reparație',
  RENOVATION: 'Renovare',
  CONSTRUCTION: 'Construcție',
};

const serviceTypeIcons: Record<ServiceType, React.ReactNode> = {
  REPAIR: <Wrench className="w-6 h-6" />,
  RENOVATION: <Home className="w-6 h-6" />,
  CONSTRUCTION: <Building2 className="w-6 h-6" />,
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  URGENT: 'Urgentă (24-48 ore)',
  THIS_WEEK: 'Săptămâna aceasta',
  THIS_MONTH: 'Luna aceasta',
  FLEXIBLE: 'Flexibil',
};

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(1);

  const initialType = (searchParams.get('type') as ServiceType) || 'REPAIR';

  const [formData, setFormData] = useState({
    serviceType: initialType,
    categoryId: 0,
    problemType: '',
    problemDescription: '',
    urgencyLevel: 'THIS_WEEK' as UrgencyLevel,
    city: '',
    zone: '',
    address: '',
    preferredDate: '',
    preferredTimeSlot: '',
    estimatedBudget: '',
    needsInspection: false,
    clientProvidesParts: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.userType !== 'CLIENT') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    categoriesApi.getByType(formData.serviceType).then((res) => {
      setCategories(res.data);
    });
  }, [formData.serviceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await repairRequestsApi.create({
        categoryId: formData.categoryId,
        problemType: formData.problemType,
        problemDescription: formData.problemDescription,
        urgencyLevel: formData.urgencyLevel,
        city: formData.city,
        zone: formData.zone,
        address: formData.address,
        preferredDate: formData.preferredDate || undefined,
        preferredTimeSlot: formData.preferredTimeSlot || undefined,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
        needsInspection: formData.needsInspection,
        clientProvidesParts: formData.clientProvidesParts,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la crearea cererii');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Cerere nouă - {serviceTypeLabels[formData.serviceType]}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Service Type Selector */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Tip serviciu</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['REPAIR', 'RENOVATION', 'CONSTRUCTION'] as ServiceType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, serviceType: type, categoryId: 0 })}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                  formData.serviceType === type
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {serviceTypeIcons[type]}
                <span className="text-sm font-medium">{serviceTypeLabels[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Category & Problem */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              1. Ce problemă ai?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                      className={`px-4 py-2 rounded-full text-sm transition ${
                        formData.categoryId === cat.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip problemă / Serviciu dorit
                </label>
                <input
                  type="text"
                  required
                  value={formData.problemType}
                  onChange={(e) => setFormData({ ...formData, problemType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="ex: Țeavă spartă, Instalare cabină duș, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descriere detaliată
                </label>
                <textarea
                  rows={4}
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none text-gray-900"
                  placeholder="Descrie problema în detaliu pentru a primi oferte mai precise..."
                />
              </div>
            </div>
          </div>

          {/* Step 2: Urgency & Schedule */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              2. Când ai nevoie?
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgență
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(urgencyLabels) as UrgencyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgencyLevel: level })}
                      className={`px-4 py-3 rounded-lg text-sm text-left transition ${
                        formData.urgencyLevel === level
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {urgencyLabels[level]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data preferată (opțional)
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval orar (opțional)
                  </label>
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  >
                    <option value="">Oricare</option>
                    <option value="08:00-12:00">Dimineața (08-12)</option>
                    <option value="12:00-17:00">După-amiaza (12-17)</option>
                    <option value="17:00-20:00">Seara (17-20)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Location */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              3. Unde?
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oraș
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="București"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zonă / Sector
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="Sector 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresă completă (opțional - vizibilă doar după acceptarea ofertei)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="Strada, număr, bloc, scară, etaj, apartament"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Budget & Options */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              4. Alte detalii
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buget estimat (opțional, RON)
                </label>
                <input
                  type="number"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="ex: 500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsInspection}
                    onChange={(e) => setFormData({ ...formData, needsInspection: e.target.checked })}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700">
                    Am nevoie de o vizită de evaluare înainte de ofertă
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.clientProvidesParts}
                    onChange={(e) => setFormData({ ...formData, clientProvidesParts: e.target.checked })}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700">
                    Voi asigura eu materialele/piesele necesare
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition"
            >
              Anulează
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.categoryId}
              className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se trimite...' : 'Trimite cererea'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Se încarcă...</div>}>
      <NewRequestContent />
    </Suspense>
  );
}
