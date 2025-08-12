import { IoSearchOutline } from "react-icons/io5";
import Button from "./Button";
import Input from "./Input";

interface PageHeaderProps {
  title: string;
  onAdd?: () => void;
  addButtonText: string;
  showAddButton?: boolean;
  searchQuery?: string;
  onSearch?: (value: string) => void;
}

const PageHeader = ({
  title,
  onAdd,
  addButtonText,
  showAddButton = true,
  searchQuery = "",
  onSearch,
}: PageHeaderProps) => {
  return (
    <div className='flex justify-between items-center md:flex-nowrap flex-wrap gap-2 py-6 px-8 border-b border-[var(--border-color)]'>
      <h1 className='text-2xl font-semibold text-[var(--text-secondary)]'>
        {title}
      </h1>
      <div className='flex items-center space-x-4 ms-auto'>
        {showAddButton && onAdd && (
          <Button variant='primary' onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
        {onSearch && (
          <Input
            fullWidth={false}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            leftIcon={<IoSearchOutline className='w-5 h-5' />}
          />
        )}
      </div>
    </div>
  );
};

export default PageHeader;
