import { MdClose } from "react-icons/md";

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
}

export default function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  return (
    <div className='relative'>
      <div className='h-22 w-22 object-cover rounded-lg bg-[#F6F6F6] flex items-center justify-center'>
        <img
          src={src}
          alt='Preview'
          className='h-24 w-24 object-cover rounded-lg'
        />
      </div>
      <button
        type='button'
        onClick={onRemove}
        className='absolute -top-2 -right-2 bg-[#F6F6F6] text-black rounded-full border border-gray-300 p-1 hover:bg-red-600 hover:text-white cursor-pointer'
      >
        <MdClose className='w-4 h-4' />
      </button>
    </div>
  );
}
