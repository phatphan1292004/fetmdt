export function FloatingContactButtons() {
  return (
    <div className="fixed bottom-6 right-5 z-30 flex flex-col gap-3">
      <button
        type="button"
        className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d7e6f7] bg-white text-[24px] font-bold text-[#1778f2] shadow-[0_10px_20px_rgba(10,50,100,0.18)]"
      >
        Zalo
      </button>

      <button
        type="button"
        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25c3c8] text-white shadow-[0_10px_20px_rgba(6,118,124,0.25)]"
        aria-label="Liên hệ nhanh"
      >
        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M4.9 1.7C5.4 1.2 6.1 1 6.8 1.2L9 1.8C9.9 2 10.5 2.8 10.5 3.7L10.4 5.8C10.4 6.5 10 7.1 9.4 7.4L8 8.1C8.8 9.7 10.1 11 11.9 12L12.6 10.6C12.9 10 13.5 9.6 14.2 9.6L16.3 9.5C17.2 9.5 18 10.1 18.2 11L18.8 13.2C19 13.9 18.8 14.6 18.3 15.1L16.9 16.5C16.2 17.2 15.2 17.5 14.2 17.3C8.1 16 4 11.9 2.7 5.8C2.5 4.8 2.8 3.8 3.5 3.1L4.9 1.7Z" />
        </svg>
      </button>
    </div>
  );
}