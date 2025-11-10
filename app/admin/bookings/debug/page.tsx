import { createClient } from "@/lib/supabase/server"

export default async function BookingsDebugPage() {
  const supabase = await createClient()

  // Intentar obtener las reservas con diferentes queries
  const { data: bookings1, error: error1 } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: bookings2, error: error2 } = await supabase
    .from("bookings")
    .select(`
      *,
      package:pkg_packages(title, slug, destination),
      user:profiles(full_name)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Bookings Debug</h1>

      <div>
        <h2 className="text-xl font-semibold mb-4">Query 1: Simple Select</h2>
        {error1 ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="font-mono text-sm text-red-800">{JSON.stringify(error1, null, 2)}</p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="mb-2 font-semibold">Reservas encontradas: {bookings1?.length || 0}</p>
            <pre className="text-xs overflow-auto">{JSON.stringify(bookings1, null, 2)}</pre>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Query 2: With Relations</h2>
        {error2 ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="font-mono text-sm text-red-800">{JSON.stringify(error2, null, 2)}</p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="mb-2 font-semibold">Reservas encontradas: {bookings2?.length || 0}</p>
            <pre className="text-xs overflow-auto">{JSON.stringify(bookings2, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
