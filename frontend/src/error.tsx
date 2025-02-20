import { useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  console.error(error); // Log the error for debugging

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-red-600">Oops! Something went wrong.</h1>
      <p className="text-gray-700 mt-2">
        {error.statusText || error.message || "An unexpected error occurred."}
      </p>
      <a href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Go Home
      </a>
    </div>
  );
}

export default ErrorPage;
