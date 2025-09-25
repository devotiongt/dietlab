import { Link } from 'react-router-dom'

export default function AuthFooter({ text, linkText, linkTo }) {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{text}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to={linkTo}
          className="font-medium text-green-600 hover:text-green-500"
        >
          {linkText}
        </Link>
      </div>
    </div>
  )
}