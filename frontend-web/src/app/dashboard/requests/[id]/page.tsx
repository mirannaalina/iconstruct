'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { repairRequestsApi, offersApi, messagesApi } from '@/lib/api';
import type { RepairRequest, RepairOffer } from '@/types';
import { ArrowLeft, MapPin, Clock, Calendar, User, Phone, CheckCircle, XCircle, MessageCircle } from 'lucide-react';

const statusLabels: Record<string, string> = {
  ACTIVE: 'Activă',
  IN_PROGRESS: 'În derulare',
  ON_THE_WAY: 'În drum',
  WORKING: 'Se lucrează',
  COMPLETED: 'Finalizată',
  CANCELLED: 'Anulată',
  EXPIRED: 'Expirată',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  ON_THE_WAY: 'bg-purple-100 text-purple-800',
  WORKING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

const urgencyLabels: Record<string, string> = {
  URGENT: 'Urgentă (24-48 ore)',
  THIS_WEEK: 'Săptămâna aceasta',
  THIS_MONTH: 'Luna aceasta',
  FLEXIBLE: 'Flexibil',
};

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [offers, setOffers] = useState<RepairOffer[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For professional offer form
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    laborPrice: '',
    partsPrice: '',
    partsOption: 'PROFESSIONAL_BRINGS' as 'PROFESSIONAL_BRINGS' | 'PLATFORM_PROVIDES' | 'CLIENT_HAS',
    partsDescription: '',
    estimatedDurationMinutes: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, params.id]);

  const loadData = async () => {
    try {
      const requestId = Number(params.id);
      const [requestRes, offersRes] = await Promise.all([
        repairRequestsApi.getById(requestId),
        offersApi.getForRequest(requestId),
      ]);
      setRequest(requestRes.data);
      setOffers(offersRes.data);

      // Load unread messages count if request is in progress
      if (requestRes.data.status === 'IN_PROGRESS') {
        try {
          const unreadRes = await messagesApi.getUnreadCount(requestId);
          setUnreadCount(unreadRes.data);
        } catch {
          // Ignore error for unread count
        }
      }
    } catch (err: any) {
      setError('Eroare la încărcarea cererii');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await offersApi.create(Number(params.id), {
        laborPrice: parseFloat(offerData.laborPrice),
        partsPrice: offerData.partsPrice ? parseFloat(offerData.partsPrice) : undefined,
        partsOption: offerData.partsOption,
        partsDescription: offerData.partsDescription || undefined,
        estimatedDurationMinutes: offerData.estimatedDurationMinutes
          ? parseInt(offerData.estimatedDurationMinutes)
          : undefined,
        notes: offerData.notes || undefined,
      });
      setShowOfferForm(false);
      loadData(); // Reload to show new offer
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la trimiterea ofertei');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    try {
      await offersApi.accept(offerId);
      loadData();
    } catch (err: any) {
      setError('Eroare la acceptarea ofertei');
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    try {
      await offersApi.reject(offerId);
      loadData();
    } catch (err: any) {
      setError('Eroare la respingerea ofertei');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Se încarcă...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Cererea nu a fost găsită</div>
      </div>
    );
  }

  const isClient = user?.userType === 'CLIENT';
  const isProfessional = user?.userType === 'PROFESSIONAL';
  const hasSubmittedOffer = offers.some(o => o.professional?.id === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {request.category?.name} - {request.problemType}
            </h1>
            <p className="text-sm text-gray-500">
              Cerere #{request.id}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
            {statusLabels[request.status]}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalii cerere</h2>

              {request.problemDescription && (
                <p className="text-gray-700 mb-4">{request.problemDescription}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{request.city}, {request.zone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{urgencyLabels[request.urgency] || request.urgency}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Creată: {new Date(request.createdAt).toLocaleDateString('ro-RO')}</span>
                </div>
              </div>
            </div>

            {/* Offers Section */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Oferte ({offers.length})
                </h2>
                {isProfessional && request.status === 'ACTIVE' && !hasSubmittedOffer && (
                  <button
                    onClick={() => setShowOfferForm(!showOfferForm)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                  >
                    Trimite ofertă
                  </button>
                )}
              </div>

              {/* Offer Form for Professionals */}
              {showOfferForm && (
                <form onSubmit={handleSubmitOffer} className="bg-orange-50 rounded-lg p-4 mb-4 space-y-4">
                  <h3 className="font-medium text-gray-900">Oferta ta</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preț manoperă (RON) *
                      </label>
                      <input
                        type="number"
                        required
                        value={offerData.laborPrice}
                        onChange={(e) => setOfferData({ ...offerData, laborPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preț piese/materiale (RON)
                      </label>
                      <input
                        type="number"
                        value={offerData.partsPrice}
                        onChange={(e) => setOfferData({ ...offerData, partsPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cine asigură piesele?
                    </label>
                    <select
                      value={offerData.partsOption}
                      onChange={(e) => setOfferData({ ...offerData, partsOption: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                    >
                      <option value="PROFESSIONAL_BRINGS">Eu aduc piesele</option>
                      <option value="CLIENT_HAS">Clientul are piesele</option>
                      <option value="PLATFORM_PROVIDES">Nu sunt necesare piese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durată estimată (minute)
                    </label>
                    <input
                      type="number"
                      value={offerData.estimatedDurationMinutes}
                      onChange={(e) => setOfferData({ ...offerData, estimatedDurationMinutes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                      placeholder="ex: 60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note adiționale
                    </label>
                    <textarea
                      value={offerData.notes}
                      onChange={(e) => setOfferData({ ...offerData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none text-gray-900"
                      placeholder="Detalii despre disponibilitate, experiență, etc."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOfferForm(false)}
                      className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
                    >
                      {submitting ? 'Se trimite...' : 'Trimite oferta'}
                    </button>
                  </div>
                </form>
              )}

              {/* Offers List */}
              {offers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {isClient
                    ? 'Încă nu ai primit oferte. Profesioniștii vor fi notificați.'
                    : 'Nu există oferte încă.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`border rounded-lg p-4 ${
                        offer.status === 'ACCEPTED'
                          ? 'border-green-500 bg-green-50'
                          : offer.status === 'REJECTED'
                          ? 'border-red-200 bg-red-50 opacity-60'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {offer.professional?.firstName} {offer.professional?.lastName}
                            </p>
                            {offer.professional?.companyName && (
                              <p className="text-sm text-gray-500">{offer.professional.companyName}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">
                            {offer.totalPrice || (parseFloat(String(offer.laborPrice)) + (offer.partsPrice || 0))} RON
                          </p>
                          {offer.status === 'ACCEPTED' && (
                            <span className="text-green-600 text-sm font-medium">Acceptată</span>
                          )}
                          {offer.status === 'REJECTED' && (
                            <span className="text-red-600 text-sm font-medium">Respinsă</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>Manoperă: {offer.laborPrice} RON</div>
                        {offer.partsPrice && <div>Piese: {offer.partsPrice} RON</div>}
                        {offer.estimatedDurationMinutes && (
                          <div>Durată: ~{offer.estimatedDurationMinutes} min</div>
                        )}
                      </div>

                      {offer.notes && (
                        <p className="text-sm text-gray-600 mb-3 italic">"{offer.notes}"</p>
                      )}

                      {/* Actions for Client */}
                      {isClient && offer.status === 'PENDING' && request.status === 'ACTIVE' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Acceptă
                          </button>
                          <button
                            onClick={() => handleRejectOffer(offer.id)}
                            className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Respinge
                          </button>
                        </div>
                      )}

                      {/* Contact info if accepted */}
                      {offer.status === 'ACCEPTED' && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-2">Contact profesionist:</p>
                          {offer.professional?.phoneNumber && (
                            <a
                              href={`tel:${offer.professional.phoneNumber}`}
                              className="flex items-center gap-2 text-green-700 hover:underline"
                            >
                              <Phone className="w-4 h-4" />
                              {offer.professional.phoneNumber}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info (for professionals) */}
            {isProfessional && request.client && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Client</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.client.firstName} {request.client.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {request.status === 'IN_PROGRESS' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Acțiuni</h3>
                <Link
                  href={`/dashboard/messages/${request.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition relative"
                >
                  <MessageCircle className="w-5 h-5" />
                  Mesaje
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
