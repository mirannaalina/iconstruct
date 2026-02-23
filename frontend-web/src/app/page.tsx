import Link from 'next/link';
import { Wrench, Home, Building2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">iConstruct</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-orange-600 transition"
            >
              Autentificare
            </Link>
            <Link
              href="/register"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Înregistrare
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Găsește meșterul potrivit
          <br />
          <span className="text-orange-600">în câteva minute</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Conectăm clienții cu cei mai buni profesioniști pentru reparații,
          renovări și construcții. Rapid, sigur și transparent.
        </p>
        <Link
          href="/register"
          className="bg-orange-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-orange-700 transition inline-block"
        >
          Începe gratuit
        </Link>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Serviciile noastre
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Reparații */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Reparații
            </h4>
            <p className="text-gray-600 mb-6">
              Instalator, electrician, centrală termică, aer condiționat și
              multe altele. Urgente sau programate.
            </p>
            <Link
              href="/register?type=CLIENT"
              className="text-orange-600 font-medium hover:underline"
            >
              Solicită reparație →
            </Link>
          </div>

          {/* Renovări */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Renovări
            </h4>
            <p className="text-gray-600 mb-6">
              Renovare baie, bucătărie, apartament sau casă completă. Primești
              oferte de la firme verificate.
            </p>
            <Link
              href="/register?type=CLIENT"
              className="text-orange-600 font-medium hover:underline"
            >
              Solicită renovare →
            </Link>
          </div>

          {/* Construcții */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Construcții
            </h4>
            <p className="text-gray-600 mb-6">
              Case, duplexuri, anexe, garaje. Proiecte mari cu etape clare și
              bugete transparente.
            </p>
            <Link
              href="/register?type=CLIENT"
              className="text-orange-600 font-medium hover:underline"
            >
              Solicită construcție →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA for Professionals */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ești meseriaș sau firmă de construcții?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Înregistrează-te și primește cereri de la clienți din zona ta.
            Crește-ți afacerea cu iConstruct.
          </p>
          <Link
            href="/register?type=PROFESSIONAL"
            className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition inline-block"
          >
            Înregistrează-te ca profesionist
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 iConstruct. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
}
