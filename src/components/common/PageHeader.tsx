import { IoSearchOutline } from "react-icons/io5";
import Button from "./Button";
import Input from "./Input";
import { useTranslation } from "react-i18next";

interface PageHeaderProps {
  title: string;
  onAdd?: () => void;
  addButtonText?: string;
  showAddButton?: boolean;
  searchQuery?: string;
  onSearch?: (value: string) => void;
}

const PageHeader = ({
  title,
  onAdd,
  addButtonText = "",
  showAddButton = true,
  searchQuery = "",
  onSearch,
}: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center md:flex-nowrap flex-wrap gap-2 py-2 px-3'>
      <h1 className='text-2xl font-semibold text-[var(--text-secondary)]'>
        {t(title)}
      </h1>
      <div className='flex items-center space-x-4 ms-auto'>
        {showAddButton && onAdd && (
          <Button variant='primary' onClick={onAdd}>
            {t("Add")} {t(addButtonText)}
          </Button>
        )}
        {onSearch && (
          <Input
            fullWidth={true}
            placeholder={`${t("Search")} ${t(title).toLowerCase()}...`}
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
