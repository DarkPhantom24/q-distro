export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#D62828] text-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold">Dashboard Admin</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Selamat Datang, Admin!
        </h2>
        <p className="text-gray-600">
          Anda sedang mengakses halaman dashboard admin.
        </p>
      </main>
    </div>
  );
}
