import PageHeader from "../../../components/common/PageHeader";
import Table from "../../../components/common/Table";

const ReviewsRoot = () => {
  return (
    <div className='bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden'>
      <PageHeader title='Reviews' addButtonText='Add' />

      <Table data={[]} columns={[]} />
    </div>
  );
};

export default ReviewsRoot;
