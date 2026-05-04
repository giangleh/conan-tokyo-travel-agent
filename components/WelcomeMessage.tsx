export function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        Welcome to Conan
      </h2>
      <p className="text-gray-500 max-w-md text-lg">
        Your expert Tokyo travel agent. Ask me about neighborhoods,
        restaurants, cafés, sightseeing, or let me plan your perfect Tokyo
        itinerary.
      </p>
    </div>
  );
}
