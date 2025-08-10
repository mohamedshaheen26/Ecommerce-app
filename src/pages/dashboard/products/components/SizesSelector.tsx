import Button from "../../../../components/common/Button";

const AVAILABLE_SIZES = ["S", "M", "X", "XL", "XXL"];

interface SizesSelectorProps {
  selectedSizes: string[];
  toggleSize: (size: string) => void;
}

export default function SizesSelector({
  selectedSizes,
  toggleSize,
}: SizesSelectorProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {AVAILABLE_SIZES.map((size) => (
        <Button
          className='rounded-sm'
          key={size}
          variant={selectedSizes.includes(size) ? "secondary" : "outline"}
          onClick={() => toggleSize(size)}
        >
          {size}
        </Button>
      ))}
    </div>
  );
}
