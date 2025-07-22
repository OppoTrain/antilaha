import { PostPage } from "@/components/post-page";
import { GetServerSideProps } from "next";

// Define props interface for the Post component
interface PostPageProps {
  postId: string;
}

// Post component that renders PostPage with postId
export default function Post({ postId }: PostPageProps) {
  return <PostPage postId={postId} />;
}

// Server-side logic to extract postId from URL params
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Check if params or params.id is missing
  if (!params || !params.id || typeof params.id !== "string") {
    return {
      notFound: true, // Return 404 if id is missing or invalid
    };
  }

  return {
    props: {
      postId: params.id, // Pass the id as postId
    },
  };
};