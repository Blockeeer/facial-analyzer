export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Facial Analyzer. All rights reserved.
          </p>
          <p className="text-sm">
            Powered by AI for personalized skincare recommendations
          </p>
        </div>
      </div>
    </footer>
  )
}
