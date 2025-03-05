import Link from 'next/link';
import Image from 'next/image';

function MyComponent() {
  return (
    <div>
      <header className="bg-gray-800 p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">
            <img
              src="/images/mixtube-logo.png"
              alt="mixtube"
              className="h-8"
            />
          </Link>
          {/* Rest of the navigation links */}
        </nav>
      </header>

      {/* Rest of the component */}
      <main>
        {/* Main content here */}
      </main>
    </div>
  );
}

export default MyComponent;