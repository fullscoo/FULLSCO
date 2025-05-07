import { Link } from "wouter";

interface CourseCategoryCardProps {
  icon: React.ReactNode;
  name: string;
  count: number;
  slug: string;
}

const CourseCategoryCard = ({ icon, name, count, slug }: CourseCategoryCardProps) => {
  return (
    <Link href={`/courses/category/${slug}`}>
      <a className="flex flex-col items-center p-6 rounded-lg bg-gray-50 hover:bg-primary-50 transition duration-300 group">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary group-hover:bg-primary-200 transition">
          {icon}
        </div>
        <h3 className="font-bold text-center">{name}</h3>
        <p className="text-sm text-gray-500 text-center mt-2">{count} courses</p>
      </a>
    </Link>
  );
};

export default CourseCategoryCard;
