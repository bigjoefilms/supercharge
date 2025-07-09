export default function Footer() {
    return (
        <footer className="w-full py-6 flex justify-center items-center  absolute bottom-0">
        <span className="text-gray-500 text-sm">
          ©2025 <span className="font-bold">Supercharge.</span>  Follow{" "}
          <a
            href="https://x.com/useSupercharge"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold hover:underline "
          >
            @useSupercharge
          </a>{" "}
          on X.
        </span>
      </footer>
    );
  }