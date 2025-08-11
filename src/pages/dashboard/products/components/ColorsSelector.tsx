const AVAILABLE_COLORS = [
  { name: "Light Blue", value: "#ADD8E6" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Olive", value: "#808000" },
  { name: "Blue", value: "#0000FF" },
];

interface ColorsSelectorProps {
  selectedColors: string[];
  toggleColor: (color: string) => void;
}

export default function ColorsSelector({
  selectedColors,
  toggleColor,
}: ColorsSelectorProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {AVAILABLE_COLORS.map((color) => (
        <button
          key={color.value}
          type='button'
          onClick={() => toggleColor(color.value)}
          className={`w-8 h-8 rounded-full border-2 ${
            selectedColors.includes(color.value)
              ? "border-blue-500"
              : "border-transparent"
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
}
