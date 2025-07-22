import type { GetServerSideProps } from "next";
import { db } from "@/lib/firebase"; // Import the Admin SDK Firestore instance
import { CategoryPostsPage } from "@/components/category-posts-page";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

interface Post {
  id: string;
  title: string;
  mainImage: string;
  author: string;
  categories: string[];
  tags: string[];
  content: any[];
  createdAt: string | null; // Change to string | null for JSON serialization
  status: "draft" | "published";
}

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  image?: string;
}

interface CategoryPageProps {
  category: Category | null;
  posts: Post[];
  error: string | null;
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
  const { id } = context.query;
  const categoryId = Array.isArray(id) ? id[0] : id;

  let category: Category | null = null;
  let posts: Post[] = [];
  let error: string | null = null;

  if (!categoryId) {
    return {
      props: {
        category: null,
        posts: [],
        error: "معرف الفئة غير موجود.",
      },
    };
  }

  try {
    // Fetch category details
    const categoryDocRef = doc(db, "categories", categoryId);
    const categoryDocSnap = await getDoc(categoryDocRef);

    if (categoryDocSnap.exists()) {
      category = { id: categoryDocSnap.id, ...categoryDocSnap.data() } as Category;
    } else {
      error = "الفئة المطلوبة غير موجودة.";
      return {
        props: {
          category: null,
          posts: [],
          error,
        },
      };
    }

    // Fetch posts for the category
    const postsRef = collection(db, "posts");
    const postsQuery = query(
      postsRef,
      where("status", "==", "published"),
      where("categories", "array-contains", categoryId),
      orderBy("createdAt", "desc")
    );

    const postsSnapshot = await getDocs(postsQuery);
    posts = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null, // Convert Timestamp to ISO string
      };
    }) as Post[];
  } catch (err) {
    console.error("Error in getServerSideProps:", err);
    error = err instanceof Error ? err.message : "حدث خطأ في تحميل الفئة والمقالات.";
  }

  return {
    props: {
      category,
      posts,
      error,
    },
  };
};

export default function CategoryPage({ category, posts, error }: CategoryPageProps) {
  return <CategoryPostsPage category={category} posts={posts} error={error} />;
}