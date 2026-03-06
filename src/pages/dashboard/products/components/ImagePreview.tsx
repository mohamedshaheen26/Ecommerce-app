import { MdClose } from "react-icons/md";
import { useLanguage } from "../../../../context/LanguageContext";

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
}

export default function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  const { currentLang } = useLanguage();

  return (
    <div className='relative'>
      <div className='p-2 h-24 w-24 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center'>
        <img
          src={src}
          alt='Preview'
          className='h-full w-full object-contain rounded-lg'
        />
      </div>
      <button
        type='button'
        onClick={onRemove}
        className={`absolute -top-2 ${currentLang === "en" ? "-right-4" : "-left-4"} bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-full border border-gray-300 p-1 hover:bg-red-600 hover:text-white cursor-pointer`}
      >
        <MdClose className='w-4 h-4' />
      </button>
    </div>
  );
}
