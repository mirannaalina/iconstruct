'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { categoriesApi, repairRequestsApi } from '@/lib/api';
import type { Category, RepairRequest } from '@/types';
import { Wrench, Home, Building2, Plus, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [categoriesRes, requestsRes] = await Promise.all([
        categoriesApi.getByType('REPAIR'),
        user?.userType === 'CLIENT'
          ? repairRequestsApi.getMyRequests()
          : repairRequestsApi.getAvailable(),
      ]);

      setCategories(categoriesRes.data);
      setRequests(
        user?.userType === 'CLIENT'
          ? requestsRes.data.content || []
          : requestsRes.data || []
      );
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-orange-600">
            iConstruct
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Salut, {user?.firstName}!
            </span>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {user?.userType === 'CLIENT' ? 'Client' : 'Profesionist'}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Cereri active</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {requests.filter((r) => r.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">În derulare</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {requests.filter((r) => r.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Finalizate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {requests.filter((r) => r.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {/* Quick Actions for Clients */}
        {user?.userType === 'CLIENT' && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Solicită un serviciu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/new-request?type=REPAIR"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Reparație</h3>
                  <p className="text-sm text-gray-500">Urgentă sau programată</p>
                </div>
              </Link>

              <Link
                href="/dashboard/new-request?type=RENOVATION"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Renovare</h3>
                  <p className="text-sm text-gray-500">Baie, bucătărie, casă</p>
                </div>
              </Link>

              <Link
                href="/dashboard/new-request?type=CONSTRUCTION"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Construcție</h3>
                  <p className="text-sm text-gray-500">Casă, duplex, anexă</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.userType === 'CLIENT' ? 'Cererile mele' : 'Cereri disponibile'}
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {user?.userType === 'CLIENT'
                ? 'Nu ai nicio cerere încă. Creează prima ta cerere!'
                : 'Nu există cereri disponibile în zona ta momentan.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.category.name} - {request.problemType}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {request.city}, {request.zone}
                      </p>
                      {request.problemDescription && (
                        <p className="text-sm text-gray-600 mt-2">
                          {request.problemDescription}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          request.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : request.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status === 'ACTIVE'
                          ? 'Activă'
                          : request.status === 'IN_PROGRESS'
                          ? 'În derulare'
                          : request.status === 'COMPLETED'
                          ? 'Finalizată'
                          : request.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(request.createdAt).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
