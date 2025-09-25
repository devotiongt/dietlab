export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  )
}